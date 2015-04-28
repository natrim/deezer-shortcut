(function (global) {
  "use strict";

  global.BrowserControl = function BrowserControl(view, homeurl) {
    this.webview = view;
    this.homeurl = homeurl;
  };

  BrowserControl.prototype.back = function back() {
    var webview = global.document.querySelector(this.webview);
    if (webview.canGoBack()) webview.back();
    return this;
  };

  BrowserControl.prototype.forward = function forward() {
    var webview = global.document.querySelector(this.webview);
    if (webview.canGoForward()) webview.forward();
    return this;
  };

  BrowserControl.prototype.reload = function reload() {
    var webview = global.document.querySelector(this.webview);
    webview.reload();
    return this;
  };

  BrowserControl.prototype.home = function home() {
    var webview = global.document.querySelector(this.webview);
    webview.src = this.homeurl;
    return this;
  };

  global.TitleBar = function TitleBar(position, allowChangingPosition, browser) {
    this._name = position + "-titlebar";
    if (position !== "left" && position !== "right" && position !== "top" && position !== "bottom") throw "wrong position!";
    this._position = position;
    this.allowChangingPosition = allowChangingPosition;
    if (!global.document.getElementById("content")) throw "you need to have all things wrapped inside <div id=\"content\" />!";
    this._browser = browser;
  };

  TitleBar.prototype.closeWindow = function closeWindow(e) {
    if (e.altKey && this.allowChangingPosition) { //change titlebar position
      this.remove();
      if (this._position === 'left') {
        this._position = 'top';
      } else if (this._position === 'top') {
        this._position = 'right';
      } else if (this._position === 'right') {
        this._position = 'bottom';
      } else {
        this._position = 'left';
      }
      this._name = this._position + "-titlebar";
      this.add(this.__icon, this.__text);
    } else { //close
      global.chrome.app.window.current().close();
    }
    return this;
  };

  TitleBar.prototype.minimizeWindow = function minimizeWindow() {
    global.chrome.app.window.current().minimize();
    return this;
  };

  TitleBar.prototype.creator = {};

  TitleBar.prototype.creator.updateImageUrl = function updateImageUrl(image_id, new_image_url) {
    var image = global.document.getElementById(image_id);
    if (image)
      image.src = new_image_url;
    return this;
  };

  TitleBar.prototype.creator.createImage = function createImage(image_id, image_url) {
    var image = global.document.createElement("img");
    image.setAttribute("id", image_id);
    image.src = image_url;
    return image;
  };

  TitleBar.prototype.creator.createButton = function createButton(button_name, buttonText, titleText, normal_image_url,
    hover_image_url, click_func) {
    var button = global.document.createElement("div");
    button.setAttribute("class", "titlebar-button " + button_name);
    if (normal_image_url) {
      var button_img = this.createImage(button_name + "-image", normal_image_url);
      button.appendChild(button_img);
      if (hover_image_url) {
        button.onmouseover = (function () {
          this.updateImageUrl(button_name + "-image", hover_image_url);
        }).bind(this);
        button.onmouseout = (function () {
          this.updateImageUrl(button_name + "-image", normal_image_url);
        }).bind(this);
      }
    }
    if (click_func) {
      button.onclick = click_func;
    }
    if (titleText) {
      button.title = titleText;
    }
    if (buttonText) {
      button.innerHTML = buttonText;
    }
    return button;
  };

  TitleBar.prototype.focus = function focusTitlebar(focus) {
    var bg_color = focus ? "#23232C" : "#555959";
    var titlebar = global.document.getElementById(this._name);
    if (titlebar)
      titlebar.style.backgroundColor = bg_color;
  };

  TitleBar.prototype.add = function addTitlebar(titlebar_icon_url, titlebar_text) {
    this.__icon = titlebar_icon_url;
    this.__text = titlebar_text;
    var document = global.document;
    var titlebar = document.createElement("div");
    titlebar.setAttribute("id", this._name);
    titlebar.setAttribute("class", this._name);

    var icon = document.createElement("div");
    icon.setAttribute("class", this._name + "-icon");
    icon.appendChild(this.creator.createImage(this._name + "icon", titlebar_icon_url));
    titlebar.appendChild(icon);

    var title = document.createElement("div");
    title.setAttribute("class", this._name + "-text");
    title.innerText = titlebar_text;
    titlebar.appendChild(title);

    var closeButton = this.creator.createButton(this._name + "-button titlebar-close-button",
      "", "Close" + (this.allowChangingPosition ? "\n\n(Alt+click changes position)" : ""), null, null, this.closeWindow.bind(this));
    titlebar.appendChild(closeButton);

    var minimizeButton = this.creator.createButton(this._name + "-button titlebar-minimize-button",
      "", "Minimize", null, null, this.minimizeWindow.bind(this));
    titlebar.appendChild(minimizeButton);

    if (this._browser) {
      var backButton = this.creator.createButton(this._name + "-button titlebar-back-button",
        "", "Back", null, null, this._browser.back.bind(this._browser));
      titlebar.appendChild(backButton);

      var forwardButton = this.creator.createButton(this._name + "-button titlebar-forward-button",
        "", "Forward", null, null, this._browser.forward.bind(this._browser));
      titlebar.appendChild(forwardButton);

      var reloadButton = this.creator.createButton(this._name + "-button titlebar-reload-button",
        "", "Reload", null, null, this._browser.reload.bind(this._browser));
      titlebar.appendChild(reloadButton);

      var homeButton = this.creator.createButton(this._name + "-button titlebar-home-button",
        "", "Home", null, null, this._browser.home.bind(this._browser));
      titlebar.appendChild(homeButton);
    }

    var divider = document.createElement("div");
    divider.setAttribute("class", this._name + "-divider");
    titlebar.appendChild(divider);

    document.body.appendChild(titlebar);

    this.onfocus = (function () {
      this.focus(true);
    }).bind(this);
    global.addEventListener("focus", this.onfocus);
    this.onblur = (function () {
      this.focus(false);
    }).bind(this);
    global.addEventListener("blur", this.onblur);
    this.onresize = this.updateContentStyle.bind(this);
    global.addEventListener("resize", this.onresize);

    this.updateContentStyle();
  };

  TitleBar.prototype.remove = function removeTitlebar() {
    var document = global.document;
    var titlebar = document.getElementById(this._name);
    if (titlebar) {
      document.body.removeChild(titlebar);
      if (this.onfocus) global.removeEventListener("focus", this.onfocus);
      if (this.onblur) global.removeEventListener("blur", this.onblur);
      if (this.onresize) global.removeEventListener("resize", this.onresize);
      this.resetContentStyle();
    }
  };

  TitleBar.prototype.resetContentStyle = function resetContentStyle() {
    var document = global.document;
    var content = document.getElementById("content");
    if (!content)
      return;
    content.setAttribute("style", "");
  };

  TitleBar.prototype.updateContentStyle = function updateContentStyle() {
    if (this.callUpdateContent) clearTimeout(this.callUpdateContent);
    this.callUpdateContent = setTimeout((function () {
      var document = global.document;
      var content = document.getElementById("content");
      if (!content)
        return;

      var titlebar = document.getElementById(this._name);
      if (titlebar) {
        var left = 0;
        var top = 0;
        var width = global.outerWidth;
        var height = global.outerHeight;

        switch (this._position) {
        case "top":
          height -= titlebar.offsetHeight;
          top += titlebar.offsetHeight;
          break;
        case "bottom":
          height -= titlebar.offsetHeight;
          break;
        case "left":
          width -= titlebar.offsetWidth;
          left += titlebar.offsetWidth;
          break;
        case "right":
          width -= titlebar.offsetWidth;
          break;
        default:
          return;
        }

        var contentStyle = "position: absolute; ";
        contentStyle += "left: " + left + "px; ";
        contentStyle += "top: " + top + "px; ";
        contentStyle += "width: " + width + "px; ";
        contentStyle += "height: " + height + "px; ";
        content.setAttribute("style", contentStyle);
      }
    }).bind(this), 100);
  };
})(window);