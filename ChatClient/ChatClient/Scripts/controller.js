/// <reference path="class.js" />
/// <reference path="persisters.js" />
/// <reference path="jquery-2.0.3.js" />
/// <reference path="ui.js" />

var controllers = (function () {

    var rootUrl = "http://localhost:40643/api/";
    var Controller = Class.create({
        init: function () {
            this.persister = persisters.get(rootUrl);
        },
        loadUI: function (selector) {
            if (this.persister.isUserLoggedIn()) {
                this.loadGameUI(selector);
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
        loadGameUI: function (selector) {
            var self = this;
            var gameUIHtml = ui.gameUI(this.persister.nickname());
            $(selector).html(gameUIHtml);

            this.attachUIEventHandlers(selector);
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

                self.persister.user.login(user, function () {
                    self.loadGameUI(selector);
                }, function (err) {
                    wrapper.find("#error-messages").text(err.responseJSON.Message);
                });
                return false;
            });
            wrapper.on("click", "#btn-register", function () {
                var user = {
                    username: $(selector).find("#tb-register-username").val(),
                    nickname: $(selector).find("#tb-register-nickname").val(),
                    password: $(selector + " #tb-register-password").val()
                }
                self.persister.user.register(user, function () {
                    self.loadGameUI(selector);
                }, function (err) {
                    wrapper.find("#error-messages").text(err.responseJSON.Message);
                });
                return false;
            });
            wrapper.on("click", "#btn-logout", function () {
                self.persister.user.logout(function () {
                    self.loadLoginFormUI(selector);
                    clearInterval(updateTimer);
                }, function (err) {
                });
            });
        },
        setChatReceiver: function (channel, selector) {
            var self = this;
            this.persister.pubnub.subscribe(channel, function (message) {
                $(selector).append(message);
            });
        },
        setChatSender: function (channel, tb_selector, btn_selector) {
            var self = this;
            $(btn_selector).on("click", null, function (e) {
                e.preventDefault();
                var message = self.persister.username() + ": " + $(tb_selector).val() + '<br/>';
                $(tb_selector).val('');
                //console.log(message);
                self.persister.pubnub.publish(channel, message);
            });
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
    controller.setChatReceiver("ferdi", "#content");
    controller.setChatSender("ferdi", "#send-tb","#send-btn");
});