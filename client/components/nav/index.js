(function(){

var items = document.querySelectorAll('.reading-nav a');
var item_map = {};
var selected_item;
var marker = document.getElementById('reading-marker');

for (var i = 0; i < items.length; i++) {
  var href = items[i].getAttribute('href') || '';
  var is_anchor = href.charAt(0) === '#'; 
  item_map[href] =  {
    nav: items[i],
    index: i,
    href: href,
    target: !is_anchor ? null : document.getElementById(href.substr(1))
  };
}

function set_nav_item(hash, animate) {
  if (hash && selected_item && selected_item.href === hash) {
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

  var rect = selected_item.nav.getBoundingClientRect();
  console.dir(rect)
  console.dir(marker)
  console.dir(selected_item.nav)
  marker.style.left = selected_item.nav.offsetLeft + 'px';
  marker.style.width = selected_item.nav.offsetWidth + 'px';

  if (animate) {

    if (!marker.style.transition) {
      marker.style.transition = 'width 0.1s ease-out, left 0.2s ease';
    }

    var scrollarea = marker.parentNode;
    selected_item.timeout = setTimeout(function(){
      // console.log('blahs')
      // scrollarea.scrollLeft = selected_item.nav.offsetLeft;
    }, 1000);
  }
}

window.addEventListener('hashchange', function(event) {
  if (item_map.hasOwnProperty(location.hash)) {
    set_nav_item(location.hash);
  }
}, false);

set_nav_item(location.hash, true);


}());
