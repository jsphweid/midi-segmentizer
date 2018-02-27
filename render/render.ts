import { OSMD } from 'opensheetmusicdisplay'

const osmd = new OSMD(document.getElementById('osmd-container'), false)
osmd
	.load('./xmls/BeetAnGeSample.mxl')
	.then(() => osmd.render(), err => console.log(err))
