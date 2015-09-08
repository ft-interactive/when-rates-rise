(function(){
'use strict';

// get all the nav items
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

function set_nav_item(hash, animate, rerender) {
  // do nothing if we're already at the given item
  if (!rerender && hash && selected_item && selected_item.href === hash) {
    return;
  }

  // do nothing if we don't recognise this item
  if (!item_map.hasOwnProperty(hash)) return;

  // establish which items we're changing between
  var old_item = selected_item;
  selected_item = item_map[hash];

  // cancel any timeout that was waiting to animate for the last change (in case of two quick consecutive clicks)
  if (selected_item.timeout) {
    console.log('cancelling timeout');
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

    selected_item.timeout = setTimeout(function(){
      // console.log('blahs')
      // scrollarea.scrollLeft = selected_item.nav.offsetLeft;
    }, 1000);
  }
}

var display_marker;
var showing_nav = false;
var hash_on_load = !!location.hash && item_map[location.hash];

function showOrHideNav() {
  // grab the element if necessary
  if (!display_marker) {
    display_marker = document.getElementById('js-nav-display-marker');
  }

  if (!display_marker) return;

  // see where the display marker is in the viewport
  var point = display_marker.getBoundingClientRect().top;

  // see if the display marker is out of the viewport
  var out_of_view = point > window.innerHeight;

  if (out_of_view && showing_nav) {
    showing_nav = false;
    nav.classList.remove('on');
  }
  else if (!out_of_view && !showing_nav) {
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
window.addEventListener('hashchange', function (event) {
  if (item_map.hasOwnProperty(location.hash)) {
    set_nav_item(location.hash, true);
  }
}, false);


var scrollFrame;
window.addEventListener('scroll', function () {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(function () {
    showOrHideNav();
    var r;
    var top_half = window.innerHeight / 3;

    // update
    var itemVisible = false;
    for (var h in item_map) {
      if (!item_map.hasOwnProperty(h)) continue;

      if (item_map[h].target) {
        // FIXME: probably inefficient and janky
        r = item_map[h].target.getBoundingClientRect();

        // if (item_map[h].index === 1) {
        //   // console.log('Replace state')
        //   console.log('YES', r.top, top_half,r.top > top_half )
        //   // history.replaceState(null, '', '#');
        //   break;
        // }

        if (r.height > 0 && r.bottom > top_half && r.top < top_half) {
          itemVisible = true;

          if (h !== location.hash) {
            history.replaceState(null, '', h);
            set_nav_item(h, true);
          }

          break;
        }
      }
    }

    // set the hash to null if none of the elements are visible
    if (!itemVisible) {
      if (location.hash) {
        history.replaceState(null, '', location.href.split('#')[0]);
      }
    }
  });
});




var resizeFrame;
window.addEventListener('resize', function () {
  cancelAnimationFrame(resizeFrame);

  resizeFrame = requestAnimationFrame(function () {
    set_nav_item(location.hash, false, true);
  });
});

// TODO: redo stuff after fonts load cos measurements change

}());
