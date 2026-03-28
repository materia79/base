"use strict";

module.exports = {
	cmd: (ctx) => {
		ctx.state.buffer = [];
		ctx.state.bufferScrollOffset = 0;
		ctx.app.scheduleRender();
	},
	help: "cls                        - clear the output buffer"
};
