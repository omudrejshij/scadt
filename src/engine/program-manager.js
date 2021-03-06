import p from './programs/p.js';
import pn from './programs/pn.js';
import pc from './programs/pc.js';

export default function initProgramManager(gl) {
	return Object.freeze({
		initProgram,
		p: initProgram(gl, p),
		pn: initProgram(gl, pn),
		pc: initProgram(gl, pc),
	});
}

function initProgram(gl, rawProgram) {
	const program = gl.createProgram();

	for (const shaderType in rawProgram) {
		const shader = gl.createShader(gl[shaderType]);
		gl.shaderSource(shader, rawProgram[shaderType]);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error(gl.getShaderInfoLog(shader));
		}
		gl.attachShader(program, shader);
	}
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error('Could not initialise shaders');
	}

	// Set shader variables location links
	for (const shaderType in rawProgram) {
		const regexp = /(attribute|uniform)\s.*?\s(.*?);/g;
		let match;

		while ((match = regexp.exec(rawProgram[shaderType])) !== null) {
			if (match[1] == 'attribute') {
				program[match[2]] = gl.getAttribLocation(program, match[2]);
			} else if (match[1] == 'uniform') {
				program[match[2]] = gl.getUniformLocation(program, match[2]);
			}
		}
	}
	return program;
}
