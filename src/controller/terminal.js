const {RpgService} = require('../Class/RPG')
const rpg = new RpgService
const path = require('path')


var Menu = require('terminal-menu');

var menu = Menu({ width: 29, x: 4, y: 2 });
menu.reset();

menu.write('SERIOUS BUSINESS TERMINAL\n');
menu.write('-------------------------\n');
rpg.users.getAllUser().then(async (data) =>{
  let ids = Object.keys(data)

  for(const id of ids){
    let name = data[id].name
      menu.add(name);
  }
  menu.add('EXIT');
  menu.on('select', function (label) {
      menu.close();
      console.log('SELECTED: ' + label);
  });
  process.stdin.pipe(menu.createStream()).pipe(process.stdout);

  process.stdin.setRawMode(true);
  menu.on('close', function () {
      process.stdin.setRawMode(false);
      process.stdin.end();
  });
})
