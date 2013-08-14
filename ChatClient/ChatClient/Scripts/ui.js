﻿/// <reference path="jquery-2.0.3.js" />
var ui = (function () {

    function buildLoginForm() {
        var html =
            '<div id="login-form-holder">' +
				'<form>' +
					'<div id="login-form">' +
						'<label for="tb-login-username">Username: </label>' +
						'<input type="text" id="tb-login-username"><br />' +
						'<label for="tb-login-password">Password: </label>' +
						'<input type="text" id="tb-login-password"><br />' +
						'<button id="btn-login" class="button">Login</button>' +
					'</div>' +
					'<div id="register-form" style="display: none">' +
						'<label for="tb-register-username">Username: </label>' +
						'<input type="text" id="tb-register-username"><br />' +
						'<label for="tb-register-nickname">Nickname: </label>' +
						'<input type="text" id="tb-register-nickname"><br />' +
						'<label for="tb-register-password">Password: </label>' +
						'<input type="text" id="tb-register-password"><br />' +
						'<button id="btn-register" class="button">Register</button>' +
					'</div>' +
					'<a href="#" id="btn-show-login" class="button selected">Login</a>' +
					'<a href="#" id="btn-show-register" class="button">Register</a>' +
				'</form>' +
				'<div id="error-messages"></div>' +
            '</div>';
        return html;
    }

    function buildChatUI(username) {
        var html = '<h1>hello chat</h1>';
        return html;
    }

    function buildMessagesList(messages) {
        var list = '<ul class="messages-list">';
        var msg;
        for (var i = 0; i < messages.length; i += 1) {
            msg = messages[i];
            var item =
				'<li>' +
					'<a href="#" class="message-state-' + msg.state + '">' +
						msg.text +
					'</a>' +
				'</li>';
            list += item;
        }
        list += '</ul>';
        return list;
    }

    function appendTextWithColor(selector, message, color) {
        var paragraph = $('<p>');
        paragraph.css("color", color);
        paragraph.html(message);
        $(selector).append(paragraph);
    }
    return {
        chatUI: buildChatUI,
        loginForm: buildLoginForm,
        messagesList: buildMessagesList,
        appendTextWithColor: appendTextWithColor,
    }

}());