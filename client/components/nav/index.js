(function(){
'use strict';

var items = document.querySelectorAll('.reading-nav a');
var nav = items[0].parentNode;
var item_map = {};
var selected_item;
var marker = document.getElementById('reading-marker');

for (var i = 0; i < items.length; i++) {
  var href = items[i].getAttribute('href') || '';
  var is_anchor = href.charAt(0) === '#';
  var target = !is_anchor ? null : document.getElementById(href.substr(1));
  item_map[href] = {
    nav: items[i],
    index: i,
    href: href,
    target: target
  };

}

function scroll_top() {
  return window.pageYOffset ||
          (document.documentElement && document.documentElement.scrollTop) ||
            document.body.scrollTop;
}

function set_nav_item(hash, animate, rerender) {
  if (!rerender && hash && selected_item && selected_item.href === hash) {
    return;
  }

  if (!item_map.hasOwnProperty(hash)) {
    return;
  }


  var old_item = selected_item;
  selected_item = item_map[hash];

  if (selected_item.timeout) {
    clearTimeout(selected_item.timeout);
  }

  if (animate && !marker.style.transition) {
    marker.style.transition = 'width 0.1s ease-out, left 0.2s ease';
  }

  marker.style.left = selected_item.nav.offsetLeft + 'px';
  marker.style.width = selected_item.nav.offsetWidth + 'px';

  if (old_item) {
    old_item.nav.classList.remove('selected');
  }

  selected_item.nav.classList.add('selected');

  if (animate) {

    if (!marker.style.transition) {
      marker.style.transition = 'width 0.1s ease-out, left 0.2s ease';
    }

    selected_item.timeout = setTimeout(centre_nav_on_selected_item, 250);
  }
}

function centre_nav_on_selected_item() {
  // if nav bar contents are wider than can fit (i.e. mobile)...

  if (nav.scrollWidth > nav.offsetWidth) {
    // adjust the scroll to centre the selected item
    // (or just as far as the scroll will go)

    var r = selected_item.nav.getBoundingClientRect();
    var viewportWidth = window.innerWidth;

    // what would its scrollLeft be ideally?
    var idealLeft = (viewportWidth / 2) - (r.width / 2);

    // how much does it need to change?
    var changeBy = idealLeft - r.left;

    // so what is the new scrollLeft for the nav?
    var targetScrollLeft = nav.scrollLeft - changeBy;
    if (targetScrollLeft < 0) targetScrollLeft = 0;

    // set it
    nav.scrollLeft = targetScrollLeft; // TODO: animate it?
  }
}

var display_marker;
var showing_nav = false;
var hash_on_load = !!location.hash && item_map[location.hash];

function show_nav(){

  if (!display_marker) {
    display_marker = document.getElementById('js-nav-display-marker');
  }

  if (!display_marker) return;

  var point = display_marker.getBoundingClientRect().top;
  var out_of_view = point > window.innerHeight / 3;

  if (out_of_view && showing_nav) {
    showing_nav = false;
    nav.classList.remove('on');
  } else if (!out_of_view && !showing_nav) {
    if (hash_on_load && !nav.style.transition) {
      nav.style.transition = 'top .2s ease-in;';
    }
    showing_nav = true;
    nav.classList.add('on');
    set_nav_item(location.hash, false, true);
  }

}

set_nav_item(location.hash, false);

// when user clicks anchor links
window.addEventListener('hashchange', function () {
  if (item_map.hasOwnProperty(location.hash)) {
    set_nav_item(location.hash, true);
  }
}, false);


// whenever page scroll offset changes, ensure the current nav item is highlighted
// and ensure the hash is correct
var scrollFrame;
window.addEventListener('scroll', function () {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(function () {
    show_nav();

    if (scroll_top() < window.innerHeight / 3) {
      history.replaceState(null, '', location.pathname + location.search);
      return;
    }

    var r;
    var top_half = window.innerHeight / 3;
    for (var h in item_map) {
      if (item_map[h].target && h !== location.hash) {
        // FIXME: probably inefficient and janky
        r = item_map[h].target.getBoundingClientRect();

        if (r.height > 0 && r.bottom > top_half && r.top < top_half) {
          // replaceState does not trigger a hashchange event
          history.replaceState(null, '', h);
          set_nav_item(h, true);
          break;
        }
      }
    }
  });
});


// redo stuff whenever the window changes size (throttled to framerate)
var resizeFrame;
window.addEventListener('resize', function () {
  cancelAnimationFrame(resizeFrame);

  resizeFrame = requestAnimationFrame(function () {
    set_nav_item(location.hash, false, true);
    centre_nav_on_selected_item();
  });
});

// redo stuff after fonts load cos measurements change
window.addEventListener('load', function(){
  set_nav_item(location.hash, false, true);
});

}());
