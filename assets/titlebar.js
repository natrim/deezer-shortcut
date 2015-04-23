function closeWindow() {
  window.close();
}

function backWindow() {
  var webview = document.querySelector('#deezerview');
  if (webview.canGoBack()) webview.back();
}

function forwardWindow() {
  var webview = document.querySelector('#deezerview');
  if (webview.canGoForward()) webview.forward();
}

function reloadWindow() {
  document.querySelector('#deezerview').reload();
}

function homeWindow() {
  document.querySelector('#deezerview').src = "http://www.deezer.com/";
}

function minimizeWindow() {
  chrome.app.window.current().minimize();
}

function updateImageUrl(image_id, new_image_url) {
  var image = document.getElementById(image_id);
  if (image)
    image.src = new_image_url;
}

function createImage(image_id, image_url) {
  var image = document.createElement("img");
  image.setAttribute("id", image_id);
  image.src = image_url;
  return image;
}

function createButton(button_id, button_name, buttonText, titleText, normal_image_url,
  hover_image_url, click_func) {
  var button = document.createElement("div");
  button.setAttribute("class", button_name);
  if (normal_image_url) {
    var button_img = createImage(button_id, normal_image_url);
    button.appendChild(button_img);
    if (hover_image_url) {
      button.onmouseover = function () {
        updateImageUrl(button_id, hover_image_url);
      };
      button.onmouseout = function () {
        updateImageUrl(button_id, normal_image_url);
      };
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
}

function focusTitlebars(focus) {
  var bg_color = focus ? "#23232C" : "#3a3d3d";
  var titlebar = document.getElementById("left-titlebar");
  if (titlebar)
    titlebar.style.backgroundColor = bg_color;
}

function addTitlebar(titlebar_name, titlebar_icon_url, titlebar_text) {
  var titlebar = document.createElement("div");
  titlebar.setAttribute("id", titlebar_name);
  titlebar.setAttribute("class", titlebar_name);

  var icon = document.createElement("div");
  icon.setAttribute("class", titlebar_name + "-icon");
  icon.appendChild(createImage(titlebar_name + "icon", titlebar_icon_url));
  titlebar.appendChild(icon);

  var title = document.createElement("div");
  title.setAttribute("class", titlebar_name + "-text");
  title.innerText = titlebar_text;
  titlebar.appendChild(title);

  var minimizeButton = createButton(titlebar_name + "-minimize-button",
    titlebar_name + "-minimize-button",
    "&#8212;", "Minimize", null, null, minimizeWindow);
  titlebar.appendChild(minimizeButton);

  var backButton = createButton(titlebar_name + "-back-button",
    titlebar_name + "-back-button",
    "&#9664;", "Back", null, null, backWindow);
  titlebar.appendChild(backButton);

  var forwardButton = createButton(titlebar_name + "-forward-button",
    titlebar_name + "-forward-button",
    "&#9654;", "Forward", null, null, forwardWindow);
  titlebar.appendChild(forwardButton);

  var reloadButton = createButton(titlebar_name + "-reload-button",
    titlebar_name + "-reload-button",
    "&#8635;", "Reload", null, null, reloadWindow);
  titlebar.appendChild(reloadButton);

  var homeButton = createButton(titlebar_name + "-home-button",
    titlebar_name + "-home-button",
    "&#8962;", "Home", null, null, homeWindow);
  titlebar.appendChild(homeButton);

  var closeButton = createButton(titlebar_name + "-close-button",
    titlebar_name + "-close-button",
    "", "Close",
    "assets/button_close.png",
    "assets/button_close_hover.png",
    closeWindow);
  titlebar.appendChild(closeButton);

  var divider = document.createElement("div");
  divider.setAttribute("class", titlebar_name + "-divider");
  titlebar.appendChild(divider);

  document.body.appendChild(titlebar);
}

function removeTitlebar(titlebar_name) {
  var titlebar = document.getElementById(titlebar_name);
  if (titlebar)
    document.body.removeChild(titlebar);
}

function updateContentStyle() {
  var content = document.getElementById("content");
  if (!content)
    return;

  var left = 0;
  var top = 0;
  var width = window.outerWidth;
  var height = window.outerHeight;

  var titlebar = document.getElementById("left-titlebar");
  if (titlebar) {
    width -= titlebar.offsetWidth;
    left += titlebar.offsetWidth;
  }

  var contentStyle = "position: absolute; ";
  contentStyle += "left: " + left + "px; ";
  contentStyle += "top: " + top + "px; ";
  contentStyle += "width: " + width + "px; ";
  contentStyle += "height: " + height + "px; ";
  content.setAttribute("style", contentStyle);
}
