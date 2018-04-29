const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let cursors;
const debugEnabled = false;
let walls, walls1;
let ground, ground1;

const debug = {
    create: function(game){
        // Create debug placeholder
        if (debugEnabled)
        {
            debug.text = game.add.text(40, 40, '', { fontSize: '12px', fill: '#FFF' });
        }
    },
    text: null,
    update: function()
    {
        if (debugEnabled)
        {
            debug.text.setText('Downtime: ' + cursors.space.timeDown + "   Uptime: " + cursors.space.timeUp);
        }
    }
};

const player = {
    sprite: null,
    actionHitBox: null,
    facing: 'down',
    create: function(game){
        // Create Player
        player.sprite = game.physics.add.sprite(100, 450, 'player');
        player.sprite.body.setSize(player.sprite.width, player.sprite.height-12);

        // Create hitbox for player
        player.actionHitbox = game.physics.add.sprite(0, 0, 'npc').setOrigin(0, 0);
        player.actionHitbox.visible = false;
    },
    adjustActionHitboxLocation: function()
    {
        let hitBoxX = player.actionHitbox.x;
        let hitBoxY = player.actionHitbox.y;

        if (player.facing === 'left')
        {
            hitBoxX = player.sprite.x - player.sprite.width * 1.5;
            hitBoxY = player.sprite.y - player.sprite.height / 2;
        }
        else if (player.facing === 'right')
        {
            hitBoxX = player.sprite.x + player.sprite.width / 2;
            hitBoxY = player.sprite.y - player.sprite.height / 2;
        }
        else if (player.facing === 'up')
        {
            hitBoxX = player.sprite.x - player.sprite.width / 2;
            hitBoxY = player.sprite.y - player.sprite.height * 1.5;
        }
        else if (player.facing === 'down')
        {
            hitBoxX = player.sprite.x - player.sprite.width / 2;
            hitBoxY = player.sprite.y + player.sprite.height / 2;
        }

        player.actionHitbox.setX(hitBoxX);
        player.actionHitbox.setY(hitBoxY);
    },
    handleInput: function()
    {
        if (cursors.left.isDown)
        {
            player.sprite.setVelocityX(-160);
            player.facing = 'left'
        }
        else if (cursors.right.isDown)
        {
            player.sprite.setVelocityX(160);
            player.facing = 'right'
        }
        else
        {
            player.sprite.setVelocityX(0);
        }

        if (cursors.up.isDown)
        {
            player.sprite.setVelocityY(-160);
            player.facing = 'up';
        }
        else if (cursors.down.isDown)
        {
            player.sprite.setVelocityY(160);
            player.facing = 'down';
        }
        else
        {
            player.sprite.setVelocityY(0);
        }
    },
    update: function(){
        player.handleInput();
        player.adjustActionHitboxLocation();
    }
};

const dialog = {
    create: function(game)
    {
        // Create dialog placeholder
        dialog.dialogText = game.add.text(16, 16, '', { fontSize: '12px', fill: '#FFF' });
    },
    displayText: function(text, callback)
    {
        if (dialog.inUse)
        {
            return;
        }
        else
        {
            dialog.inUse = true;
        }

        let delayLength = 50;

        for(let idx = 0; idx <= text.length; idx++)
        {
            let iteration = idx;

            const letterPrinter = function()
            {
                dialog.dialogText.setText(text.substring(0, iteration));

                if (iteration === text.length)
                {
                    callback();
                }
            };

            setTimeout(letterPrinter, delayLength * iteration);
        }

        const clearDialog = function()
        {
            dialog.dialogText.setText('');
            dialog.inUse = false;
        };

        setTimeout(clearDialog, 3000 + text.length * delayLength);
    },
    dialogText: null
};

const npc = {
    sprite: null,
    speed: 30,
    stopped: false,
    create: function(game){
        // Create NPC
        npc.sprite = game.physics.add.image(200, 300, 'npc');
        npc.sprite.setImmovable(true);
        npc.sprite.setCollideWorldBounds(true);
    },
    walk: function(direction, time)
    {
            if (npc.stopped)
            {
                return;
            }
            let speed = npc.speed;
            let velocityFunction = function(speed){npc.sprite.setVelocityX(speed);};

            if (direction === 'up')
            {
                speed = -speed;
                velocityFunction = function(speed){npc.sprite.setVelocityY(speed);};

            }
            if (direction === 'down')
            {
                velocityFunction = function(speed){npc.sprite.setVelocityY(speed);};
            }
            if (direction === 'left')
            {
                speed = -speed;
            }

            velocityFunction(speed);

            const changeDirection = function(){
                velocityFunction(0);
                const direction = ['up', 'down', 'left', 'right'][Math.floor((Math.random() * 4))];
                const time = 1000 + Math.floor((Math.random() * 2000) + 1);

                npc.walking = false;
                npc.walk(direction, time);
            };
            if (!npc.walking)
            {
                setTimeout(changeDirection, time);
                npc.walking = true;
            }
    },
    stop(){
        npc.walking = false;
        npc.startedwalking = false;
        npc.stopped = true;
        npc.sprite.setVelocityY(0);
        npc.sprite.setVelocityX(0);
    },
    update: function(){
        if (!npc.startedWalking && !npc.stopped)
        {
            npc.walk('up',500);
            npc.startedWalking = true;
        }
    },
    interact: function()
    {
        if (cursors.space.isDown)
        {
            npc.stop();

            dialog.displayText("hello there, stranger!\n" +
            "how did you get here??\n" +
            "the weather is nice!\n" +
            "gotta go!!\n" +
            "parting is such sweet sorrow...", function(){ npc.stopped = false; npc.walk(); });
        }
    }
};

function preload ()
{
    this.load.image('player', 'assets/sprites/player.png');
    this.load.image('npc', 'assets/sprites/npc.png');

    this.load.image('gameTiles', 'assets/sprites/terrain_atlas.png');
    this.load.tilemapTiledJSON('level1', 'assets/tilesets/island-nisi.json');
}

function create()
{
    this.map = this.add.tilemap('level1');
    var tileset = this.map.addTilesetImage('terrain_atlas','gameTiles');
    walls1 = this.map.createDynamicLayer('Walls-1', tileset);
    walls = this.map.createDynamicLayer('Walls', tileset);
    walls.setCollisionByExclusion([-1], true);

    ground = this.map.createStaticLayer('Ground', tileset);
    ground1 = this.map.createStaticLayer('Ground-1', tileset);

    player.create(this);
    npc.create(this);
    dialog.create(this);
    debug.create(this);

    ground = this.map.createStaticLayer('Foreground', tileset);

    this.cameras.main.startFollow(player.sprite);
    // Need this to prevent black lines between tiles when scrolling
    this.cameras.main.setRoundPixels(true);


    // Create cursors
    cursors = this.input.keyboard.createCursorKeys();

    // Handle physics
    this.physics.add.collider(player.sprite, npc.sprite);


    this.physics.add.collider(walls, player.sprite);
    this.physics.add.collider(walls, npc.sprite);

    // Handle overlap
    this.physics.add.overlap(player.actionHitbox, npc.sprite, npc.interact, null, this);
}

function update ()
{
    player.update();
    npc.update();
    debug.update();
}
