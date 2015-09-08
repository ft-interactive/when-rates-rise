(function(){

var items = document.querySelectorAll('.reading-nav a');
var nav = items[0].parentNode;
var item_map = {};
var selected_item;
var marker = document.getElementById('reading-marker');

for (var i = 0; i < items.length; i++) {
  var href = items[i].getAttribute('href') || '';
  var is_anchor = href.charAt(0) === '#';
  var target = !is_anchor ? null : document.getElementById(href.substr(1));
  item_map[href] =  {
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

  var rect = selected_item.nav.getBoundingClientRect();
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
var nav;
var showing_nav = false;
var hash_on_load = !!location.hash && item_map[location.hash];

function show_nav(){

  if (!display_marker) {
    display_marker = document.getElementById('js-nav-display-marker');
  }

  if (!display_marker) return;

  var point = display_marker.getBoundingClientRect().top;
  var out_of_view = point > window.innerHeight;

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
window.addEventListener('hashchange', function(event) {
  if (item_map.hasOwnProperty(location.hash)) {
    set_nav_item(location.hash, true);
  }
}, false);

window.addEventListener('scroll', function(){
  // TODO: debounce/throttle a little
  show_nav();
  var r;
  var top_half = window.innerHeight / 3;

  for (var h in item_map) {
    if (item_map[h].target && h !== location.hash) {
      // FIXME: probably inefficient and janky
      r = item_map[h].target.getBoundingClientRect();

      // if (item_map[h].index === 1) {
      //   // console.log('Replace state')
      //   console.log('YES', r.top, top_half,r.top > top_half )
      //   // history.replaceState(null, '', '#');
      //   break;
      // }

      if (r.height > 0 && r.bottom > top_half && r.top < top_half) {
        // pushState does not trigger a hashchange event
        history.replaceState(null, '', h);
        set_nav_item(h, true);
        break;
      }
    }
  }

  // TODO: set the hash to null if none of the elements are visible
});

window.addEventListener('resize', function(){
  // TODO: debounce
  set_nav_item(location.hash, false, true);
});

// TODO: redo stuff after fonts load cos measurements change

}());
