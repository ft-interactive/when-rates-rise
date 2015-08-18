var navItems = document.querySelectorAll('.panels-nav__item');
var panels = document.querySelectorAll('.panels-layer');
var panel_map = {};
var selected_panel = panels[0];

var panel;

for(var i = 0, x = panels.length; i < x; i++) {
  panel = panels[i];
  panel.panel_index = i;
  panel_map[panel.id] = panel;
  console.log('x', panel, i, panel.id);
}

console.log(panel_map);

function select_panel(event) {
  var item = event.currentTarget;
  var target = item.getAttribute('href').substr(1);
  var p = panel_map[target];
  var index = p.panel_index;
  var t;
  console.log('>', index);
  for (var i = 0, x = panels.length; i < x; i++) {
    t = panels[i].panel_index;
    console.log(t, index, panels[i].style.transform = 'translate('+ ((t - index) * 100) +'%,0)');
  }
}

for(var i = 0, x = navItems.length; i < x; i++) {
  navItems[i].onclick = select_panel;
}
