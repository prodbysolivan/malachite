import { Game } from '@/game';
import { Controller } from '@modules/controller/controller';
import { Standard } from '@modules/controller/other/devices/keyboard/components/standard';
import { Keyboard } from '@modules/controller/other/devices/keyboard/keyboard';
import { DigitalKey } from '@modules/controller/other/devices/other/digitalKey';
import { Channel } from '@modules/scheduler/other/channel';
import { Scheduler } from '@modules/scheduler/scheduler';

const game = new Game({ name: 'Malachite Engine', version: '0.0.1' });

const scheduler = new Scheduler({ parent: game });
const controller = new Controller({ parent: game });

const mainChannel = new Channel({ id: 'mainChannel', name: 'MainChannel', framerate: 0 });

mainChannel.addToEntries(controller);
scheduler.addToChannels(mainChannel);

game.addToModules(scheduler);
game.addToModules(controller);

const keyboard = new Keyboard({});
const spaceKey = new DigitalKey({ name: 'Jump', id: 'Space' });
const keyE = new DigitalKey({ name: 'Interact', id: 'KeyE' });

const standard = keyboard.getFromComponents('standard') as Standard;
standard.addToKeys(spaceKey);
standard.addToKeys(keyE);

controller.addToDevices(keyboard);

const body = document.body;
body.style.transition = 'background-color 0.1s';
body.style.display = 'flex';
body.style.flexDirection = 'column';
body.style.alignItems = 'center';
body.style.justifyContent = 'center';
body.style.height = '100vh';
body.style.backgroundColor = '#2c3e50';
body.style.color = 'white';
body.style.fontFamily = 'sans-serif';
body.innerHTML =
    '<h1>Malachite Engine: Update Test</h1><p>Mantén [Espacio] para cargar o presiona [E]</p>';

spaceKey.onPress.connect(() => {
    body.style.backgroundColor = '#2ecc71';
    console.log('¡SALTO!');
});

spaceKey.onUpdate.connect((dt) => {
    if (spaceKey.isPressed) {
        console.log(`[LOOP] Cargando fuerza... DT: ${dt.toFixed(4)}`);
    }
});

spaceKey.onRelease.connect(() => {
    body.style.backgroundColor = '#2c3e50';
});

keyE.onPress.connect(() => {
    body.style.backgroundColor = '#e74c3c';
    console.log('INTERACTUAR');
});

keyE.onRelease.connect(() => {
    body.style.backgroundColor = '#2c3e50';
});

game.start();
console.log('Malachite está vivo y actualizando...');
