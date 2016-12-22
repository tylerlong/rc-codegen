import UrlSegment from './Paths';
import resolveType from './jsonType2Ts';
import Definition from './Definition';
import { operations } from '../common/swagger';

/* Get CRUD operation method. */
export default function (classes: { [urlName: string]: UrlSegment }) {
  for (let name in classes) {
    let seg = classes[name];
    let segOperations = operations.get(name);
    if (!segOperations) {
      continue;
    }
    for (let op of segOperations) {
      seg.addOperation(op);
    }
  }
}
