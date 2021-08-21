import { statusMatrix } from './statusMatrix.mjs'
import * as fs from 'fs';

console.log(await statusMatrix({ fs, dir: '.' }))
