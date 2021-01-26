# RPG-Module


## Add Item
In object.json
```json
//
{
  //Add to heal or loot object
      "name": "Item Name",
      "stats": {
        //Your stats for no stats provide null
        "heal":20, //property heal give 20 point
        "lost" :20, //property lost lose 20 point
        "atk": 2, // property atk this item has 2 pint attack
        "def": 1, // property def this item has 1 pint defence
        "spd": 2 // property spd this item has 2 pint speed
      },
      "store": {
        "sell": 5, // price of sell
        "buy": 15 // price of buy
      },
      "description": "Give 20 HP." // simple description
    }
}

```

To get a new item

```js
const RPG = require('./path/to/RPG.js')

const rpg = new RPG()
const type = "heal" // heal or loot
const itemname = "Heal potion"
rpg.getItemInfo("heal","Heal potion").then(item =>{
    console.log(item)
})
```


## Add Monster
