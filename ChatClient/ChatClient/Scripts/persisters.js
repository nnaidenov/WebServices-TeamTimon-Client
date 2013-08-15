/// <reference path="http-requester.js" />
/// <reference path="class.js" />
/// <reference path="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha1.js" />
/// <reference path="src="http://cdn.pubnub.com/pubnub-3.5.3.min.js" />

var persisters = (function () {
    var username = localStorage.getItem("username"); 
    var sessionKey = localStorage.getItem("sessionKey");

    function saveUserData(userData) {
        localStorage.setItem("username", userData.Username);
        localStorage.setItem("sessionKey", userData.SessionKey);
        username = userData.Username;
        sessionKey = userData.SessionKey;
    }
    function clearUserData() {
        localStorage.removeItem("username");
        localStorage.removeItem("sessionKey");
        username = "";
        sessionKey = "";
    }

    var MainPersister = Class.create({
        init: function (rootUrl) {
            this.rootUrl = rootUrl;
            this.user = new UserPersister(this.rootUrl);
            this.chat = new ChatPersister(this.rootUrl);
            this.channel = new ChannelPersister(this.rootUrl);
            this.file = new FilePersister(this.rootUrl);
            this.pubnub = new PubnubPersister("demo", "demo");
        },
        isUserLoggedIn: function () {
            var isLoggedIn = !username  || !sessionKey ;
            return !isLoggedIn;
        },
        username: function () {
            return username;
        }
    });

    var UserPersister = Class.create({
        init: function (rootUrl) {
            //...api/user/
            this.rootUrl = rootUrl + "users/";
        },
        login: function (user, success, error) {
            var url = this.rootUrl + "login";
            var userData = {
                username: user.username,
                password: CryptoJS.SHA1(user.username + user.password).toString()
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
                password: CryptoJS.SHA1(user.username + user.password).toString()
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
        getAll: function (success, error) {
            var url = this.rootUrl + "get";
            httpRequester.getJSON(url, success, error);
        },
        getUserById: function (id, success, error) {
            var url = this.rootUrl + "get?id=" + id;
            httpRequester.getJSON(url, success, error);
        }
    });

    var ChatPersister = Class.create({
        init: function (rootUrl) {
            this.rootUrl = rootUrl + "chats/";
        },
        create: function (userId, success, error) {
            var url = this.rootUrl + "create/" + sessionKey;
            var user = { SecondUserId: userId };
            httpRequester.postJSON(url, user, success, error);
        },
        close: function (userId, success, error) {
            var url = this.rootUrl + "close/" + sessionKey;
            var user = { SecondUserId: userId };
            httpRequester.postJSON(url, user, success, error);
        }
    });
    var ChannelPersister = Class.create({
        init: function (rootUrl) {
            this.rootUrl = rootUrl + "channels/";
        },
        getAll: function (success, error) {
            var url = this.rootUrl + "allUnsuscribeChannels/" + sessionKey;
            httpRequester.getJSON(url, success, error);
        }
    });

    var FilePersister = Class.create({
        init: function (rootUrl) {
            this.rootUrl = rootUrl + "upload/upload-avatar/" + sessionKey;
        },
        uploadFile: function (data, success, error) {
            httpRequester.post(this.rootUrl, data, success, error);
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
        subscribe: function (channel,loadHistory, success) {
            this.pubnub.subscribe({
                channel: channel,
                message: success,
            });
            //get the history for the channel
            //before the subscription
            if (loadHistory) {
                this.history(channel, success);
            }
        },
        publish: function (channel, message) {
            this.pubnub.publish({
                channel: channel,
                message: message
            })
        },
        history: function (channel, success) {
            this.pubnub.history({
                channel: channel,
                limit: 100
            }, function (messages) {
                for (var i = 0; i < messages[0].length; i++) {
                    success(messages[0][i])
                }
             });
        }
    });
    return {
        get: function (url) {
            return new MainPersister(url);
        }
    };
}());