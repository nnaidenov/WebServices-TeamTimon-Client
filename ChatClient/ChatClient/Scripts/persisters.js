/// <reference path="http-requester.js" />
/// <reference path="class.js" />
/// <reference path="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha1.js" />
/// <reference path="src="http://cdn.pubnub.com/pubnub-3.5.3.min.js" />

var persisters = (function () {
    var username = "ferdi";//localStorage.getItem("username"); !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    var sessionKey = localStorage.getItem("sessionKey");

    function saveUserData(userData) {
        localStorage.setItem("username", userData.username);
        localStorage.setItem("sessionKey", userData.sessionKey);
        username = userData.username;
        sessionKey = userData.sessionKey;
    }
    function clearUserData() {
        localStorage.removeItem("username");
        localStorage.removeItem("sessionKey");
        nickname = "";
        sessionKey = "";
    }

    var MainPersister = Class.create({
        init: function (rootUrl) {
            this.rootUrl = rootUrl;
            this.user = new UserPersister(this.rootUrl);
            this.chat = new ChatPersister(this.rootUrl);
            this.pubnub = new PubnubPersister("demo", "demo");
        },
        isUserLoggedIn: function () {
            var isLoggedIn = username != null && sessionKey != null;
            return isLoggedIn;
        },
        username: function () {
            return username;
        }
    });

    var UserPersister = Class.create({
        init: function (rootUrl) {
            //...api/user/
            this.rootUrl = rootUrl + "user/";
        },
        login: function (user, success, error) {
            var url = this.rootUrl + "login";
            var userData = {
                username: user.username,
                authCode: CryptoJS.SHA1(user.username + user.password).toString()
            };

            httpRequester.postJSON(url, userData,
                function (data) {
                    saveUserData(data);
                    success(data);
                }, error);
        },
        register: function (user, success, error) {
            var url = this.rootUrl + "register";
            var userData = {
                username: user.username,
                nickname: user.nickname,
                authCode: CryptoJS.SHA1(user.username + user.password).toString()
            };
            httpRequester.postJSON(url, userData,
                function (data) {
                    saveUserData(data);
                    success(data);
                }, error);
        },
        logout: function (success, error) {
            var url = this.rootUrl + "logout/" + sessionKey;
            httpRequester.getJSON(url, function (data) {
                clearUserData();
                success(data);
            }, error)
        },
        scores: function (success, error) {
        }
    });

    var ChatPersister = Class.create({
        init: function (rootUrl) {
            this.rootUrl = rootUrl + "chat/";
        },
        create: function (userId, success, error) {
            var url = this.rootUrl + "create/" + sessionKey;
            var user = { userId: userId };
            httpRequester.postJSON(url, user, success, error);
        },
        close: function (userId, success, error) {
            var url = this.rootUrl + "close/" + sessionKey;
            var user = { userId: userId };
            httpRequester.postJSON(url, user, success, error);
        }
    });

    var PubnubPersister = Class.create({
        init: function (publish_key, subscribe_key) {
            this.publish_key = publish_key;
            this.subscribe_key = subscribe_key;

            this.pubnub = PUBNUB.init({
                publish_key: this.publish_key,
                subscribe_key: this.subscribe_key,
                ssl: true,
            })

            //this.pubnub = PUBNUB.secure({
            //    publish_key: 'demo',
            //    subscribe_key: 'demo',
            //    ssl: true,
            //    cipher_key: 'my-super-secret-password-key'
            //});
        },
        subscribe: function (channel, success) {
            this.pubnub.subscribe({
                channel: channel,
                message: success,
            });
        },
        publish: function (channel, message) {
            this.pubnub.publish({
                channel: channel,
                message: message
            })
        },
    });
    return {
        get: function (url) {
            return new MainPersister(url);
        }
    };
}());