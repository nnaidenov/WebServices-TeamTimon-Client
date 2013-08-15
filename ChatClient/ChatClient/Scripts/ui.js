/// <reference path="jquery-2.0.3.js" />
var ui = (function () {

    function buildLoginForm() {
        var html =
            '<div id="login-form-holder">' +
                 '<div id="log-reg-nav">' +
					    '<a href="#" id="btn-show-login" class="button selected">Login</a>' +
					    '<a href="#" id="btn-show-register" class="button">Register</a>' +
                 '</div>' +
				'<form id="login-register-form">' +
					'<div id="login-form">' +
						'<label for="tb-login-username">Username: </label>' +
						'<input type="text" id="tb-login-username"><br />' +
						'<label for="tb-login-password">Password: </label>' +
						'<input type="password" id="tb-login-password"><br />' +
						'<input type="submit" id="btn-login" class="button" value="Login"/>' +
					'</div>' +
					'<div id="register-form" style="display: none">' +
						'<label for="tb-register-username">Username: </label>' +
						'<input type="text" id="tb-register-username"><br />' +
						'<label for="tb-register-password">Password: </label>' +
						'<input type="password" id="tb-register-password"><br />' +
						'<input type="submit" id="btn-register" class="button" value="Register">' +
					'</div>' +
   				'</form>' +
				'<div id="error-messages"></div>' +
            '</div>';
        return html;
    }

    function buildChatUI() {
        var html =
               '<div id="chat-and-users">' +
                   '<div id="chat-display-window">' +
                       '<div id="tabscontent">' +
                           '<ul id="active-chats-list">' +
                               '<li><a href="#chat-text-container">Welcome!</a></li>' +
                           '</ul>' +
                           '<div id="chat-text-container" class="chat-text-container">Hello to Timon chat!</div>' +
                       '</div>' +
                   '</div>' +
                   '<div id="users-window"></div>' +
               '</div>' +
               '<form id="send-form">' +
                   '<input type="text" id="send-tb" />' +
                   '<input type="submit" id="send-btn" value="send" />' +
               '</form>';
        return html;
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
        appendTextWithColor: appendTextWithColor,
    }

}());