/// <reference path="class.js" />
/// <reference path="persisters.js" />
/// <reference path="jquery-2.0.3.js" />
/// <reference path="jquery-ui-1.10.3.js" />
/// <reference path="ui.js" />

var controllers = (function () {

    //var rootUrl = "http://chatclienttimon.apphb.com/api/";
    var rootUrl = "http://localhost:8759/api/";
    var userTextColor = "#aa0000";
    var otherUsersTextColor = "#0000aa";
    var timeIntervalChats = null;
    var timeIntervalUsers = null;
    var Controller = Class.create({
        init: function () {
            this.persister = persisters.get(rootUrl);
        },
        loadUI: function (selector) {
            if (this.persister.isUserLoggedIn()) {
                this.loadChatUI(selector);
                console.log(this.persister.isUserLoggedIn());
            }
            else {
                this.loadLoginFormUI(selector);
            }
            this.attachUIEventHandlers(selector);
        },
        loadLoginFormUI: function (selector) {
            var loginFormHtml = ui.loginForm()
            $(selector).html(loginFormHtml);

        },
        loadChatUI: function (selector) {
            var self = this;
            var gameUIHtml = ui.chatUI();
            $(selector).html(gameUIHtml);
            $("#tabscontent").tabs();
            this.loadUsersList("#users-window");
            timeIntervalUsers = setInterval(function () { self.loadUsersList.call(self, "#users-window"); }, 5000);
            timeInterval = setInterval(function () {
                self.openNewChats.apply(self);
            }, 500);
            this.setChatReceiver("chat-text-container", "#chat-text-container", false);
            var greetingElement = $("<span class='left' id='greeting'>Hello, " + this.persister.username() + "<span>");
            $("#user-info").append(greetingElement);
        },
        attachUIEventHandlers: function (selector) {
            var wrapper = $(selector);
            var self = this;

            wrapper.on("click", "#btn-show-login", function () {
                wrapper.find(".button.selected").removeClass("selected");
                $(this).addClass("selected");
                wrapper.find("#login-form").show();
                wrapper.find("#register-form").hide();
            });
            wrapper.on("click", "#btn-show-register", function () {
                wrapper.find(".button.selected").removeClass("selected");
                $(this).addClass("selected");
                wrapper.find("#register-form").show();
                wrapper.find("#login-form").hide();
            });

            wrapper.on("click", "#btn-login", function () {
                var user = {
                    username: $(selector + " #tb-login-username").val(),
                    password: $(selector + " #tb-login-password").val()
                }
                console.log(user);
                self.persister.user.login(user, function () {
                    console.log("Logged in!");
                    self.loadChatUI(selector);
                }, function (err) {
                    // wrapper.find("#error-messages").text(err.responseJSON.Message);
                    console.log("Error logging in!");
                });
                return false;
            });
            wrapper.on("click", "#btn-register", function () {
                var user = {
                    username: $(selector).find("#tb-register-username").val(),
                    password: $(selector + " #tb-register-password").val()
                }
                self.persister.user.register(user, function () {
                    self.loadChatUI(selector);
                }, function (err) {
                    console.log("Error registering!");
                    //wrapper.find("#error-messages").text(err.responseJSON.Message);
                });
                return false;
            });
            wrapper.on("click", "#btn-logout", function () {
                self.persister.user.logout(function () {
                    self.loadLoginFormUI(selector);
                    clearInterval(timeIntervalChats);
                    clearInterval(timeIntervalUsers);
                }, function (err) {
                });
            });
            wrapper.on("click", "a.user", function (e) {
                e.stopPropagation();
                e.preventDefault();
                var aEl = e.target;
                var secondUserId = $(aEl).data("id");
                self.persister.chat.create(secondUserId, function () { console.log("Chat created!") },
                    function () { console.log("Error creating chat!") });
                return false;
            });
            wrapper.on("click", "#send-btn", function (e) {
                e.preventDefault();
                var message = self.persister.username() + ": " + $("#send-tb").val();
                $("#send-tb").val('');
                //Get channel
                var selectedPanel = $("#tabscontent div.chat-text-container[aria-hidden='false']");
                var channel = selectedPanel[0].id;
                self.persister.pubnub.publish(channel, message);
            });
            wrapper.on("submit", "#upload-form", function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (window.FormData !== undefined) {
                    var data = new FormData($('#upload-form')[0]);
                    console.log(data);
                    self.persister.file.uploadFile(data, function () { console.log("file uploaded"); },
                        function () { console.log("failed to upload file"); });
                } else {
                    alert("your browser sucks!");
                }

            });
        },
        openNewChats: function () {
            //execute with time interval
            //request new channels
            var self = this;
            this.persister.channel.getAll(function (channelData) {
                for (var i = 0; i < channelData.length; i++) {
                    var channel = channelData[i].ChannelName;
                    var otherUserName = channelData[i].FirstUsername;
                    if (otherUserName == self.persister.username()) {
                        otherUserName = channelData[i].SecondUsername;
                    }
                    var channelString = new String(channel);
                    if (channelString.indexOf(' ') < 0) {
                        self.createNewChatWindow(channel, otherUserName, "#tabscontent");
                    }
                }
            }, function () { });
            //create new tabs for every channel
            //set newly created divs to receive with setChatReceiver
        },
        setChatReceiver: function (channel, selector, loadHistory) {
            var self = this;
            this.persister.pubnub.subscribe(channel, loadHistory, function (message) {
                message = new String(message);
                var nameInMessage = message.substr(0, message.indexOf(":", 0));
                var color = userTextColor;
                if (nameInMessage != self.persister.username()) {
                    color = otherUsersTextColor;
                }
                ui.appendTextWithColor(selector, message, color);
                $(selector).stop().animate({
                    scrollTop: $(selector)[0].scrollHeight
                }, 800);
            });
        },
        createNewChatWindow: function (channel, otherUserName, tabsSelector) {
            //create window
            //create li element
            //attach elements to tabsSelector
            //setChatReceiver
            var chatWindow = $("#" + channel);
            if (chatWindow.length == 0) {
                chatWindow = $("<div id='" + channel + "' class = 'chat-text-container' >");
                liEl = $('<li><a href="#' + channel + '">' + otherUserName + '</a></li>');
                var tabsContainer = $(tabsSelector);
                tabsContainer.append(chatWindow);
                $(tabsSelector + " ul").append(liEl);
                tabsContainer.tabs("refresh");
                this.setChatReceiver(channel, "#" + channel, true);
            }
        },
        //setChatSender: function (channel, tb_selector, btn_selector) {
        //    var self = this;
        //    //get channel from current active chat window
        //    $(btn_selector).on("click", null, function (e) {
        //        e.preventDefault();
        //        var message = self.persister.username() + ": " + $(tb_selector).val();
        //        $(tb_selector).val('');
        //        //console.log(message);
        //        self.persister.pubnub.publish(channel, message);
        //    });
        //},
        loadUsersList: function (selector) {
            this.persister.user.getAll(function (users) {
                var ulEl = $("<ul>");
                for (var i = 0; i < users.length; i++) {
                    var liEl = $("<li>");
                    var aEl = $("<a  data-id='" + users[i].UserID + "' href='#' class='user'>");
                    aEl.html(users[i].Username);
                    liEl.html(aEl);
                    ulEl.append(liEl);
                }
                $(selector).html(ulEl);
            }, function () { console.log("Error loading users"); });
        }
    });
    return {
        get: function () {
            return new Controller();
        }
    }
}());

$(function () {
    var controller = controllers.get();
    controller.loadUI("#container");
    // controller.setChatReceiver("ferdi", "#chat-text-container");
});

