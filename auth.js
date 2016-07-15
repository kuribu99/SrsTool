module.exports = function (User, Config, app) {
    var passport = require('passport');
    var FacebookStrategy = require('passport-facebook').Strategy;

    // High level serialize/de-serialize configuration for passport
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findOne({_id: id}).exec(done);
    });

    // Facebook-specific
    passport.use(new FacebookStrategy({
        clientID: Config.FacebookAppID,
        clientSecret: Config.FacebookAppSecret,
        callbackURL: Config.WebsiteURL,
        profileFields: ['id', 'displayName']
    }, function (accessToken, refreshToken, profile, done) {
        User.findOneAndUpdate(
            {'_id': profile.id},
            {
                $set: {
                    '_id': profile.id,
                    'name': profile.displayName
                }
            },
            {'new': true, upsert: true, runValidators: true},
            function (error, user) {
                done(error, user);
            });
    }));

    // Express middlewares
    app.use(require('express-session')({
        secret: 'tH15_1s_@_*Ckrut'
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    // Express routes for auth
    app.get('/auth/facebook', function (req, res, next) {
        var redirect = encodeURIComponent(req.query.redirect || '/');
        var url = Config.WebsiteURL + 'auth/facebook/callback?redirect=' + redirect;

        passport.authenticate('facebook', {callbackURL: url})(req, res, next);
    });

    app.get('/auth/facebook/callback', function (req, res, next) {
        var redirect = encodeURIComponent(req.query.redirect || '/');
        var url = Config.WebsiteURL + 'auth/facebook/callback?redirect=' + redirect;

        passport.authenticate('facebook', {callbackURL: url})(req, res, next);
    }, function (req, res) {
        res.redirect(Config.WebsiteURL + '#/' + req.query.redirect || '/');
    });

    app.get('/auth/logout', function (req, res) {
        req.logout();
        res.redirect(Config.WebsiteURL);
    })

};