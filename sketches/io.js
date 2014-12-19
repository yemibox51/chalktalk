
   var __audio__volume__ = 1;

   function IO() {
      this.labels = "audio".split(' ');
      this.code = [
         ["sin", "sin(2 * PI * x * time)"],
         ["sawtooth", "x = x * time % 1.0;\nreturn x / 4;"],
         ["triangle", "x = 2 * x * time % 2;\nx = x < 1 ? x : 2 - x;\nreturn x;"],
         ["square", "x = 2 * x * time % 2;\nx = 2 * floor(x) - 1;\nreturn x / 8;"],
         ["noise", "return 3 * noise(3 * x * time)"],
         ["fractal", "return 3 * fractal(3 * x * time)"],
         ["turbulence", "return 5 * turbulence(3 * x * time) - 1.5"],
      ];
      this.savedCode = "";
      this.savedX = "";
      this.savedY = "";
      this.savedZ = "";
      this.audioShape = null;

      this.cleanup = function() {
         setAudioSignal(function(t) { return 0; });
      }

      this.render = function(elapsed) {
         var cs = isDef(this.selectedIndex) ? this.selectedIndex : 0;
         var t = 1/3;

         m.scale(this.size / 400);

	 __audio__volume__ = pow(Math.min(1.0, this.computePixelSize()), 2);

         mCurve([[1,1],[1,-1],[-t,-t],[-1,-t],[-1,t],[-t,t],[1,1]]);
         if ( this.code[cs][1] != this.savedCode ||
              isDef(this.in[0]) && this.inValue[0] != this.savedX ||
              isDef(this.in[1]) && this.inValue[1] != this.savedY ||
              isDef(this.in[2]) && this.inValue[2] != this.savedZ ) {

            var code = this.savedCode = this.code[cs][1];

            if (isDef(this.in[0])) this.savedX = this.inValue[0];
            if (isDef(this.in[1])) this.savedY = this.inValue[1];
            if (isDef(this.in[2])) this.savedZ = this.inValue[2];

            var var_xyz = "var x=(" + (isDef(this.in[0]) ? this.inValue[0] : 0) + ")," +
                              "y=(" + (isDef(this.in[1]) ? this.inValue[1] : 0) + ")," +
                              "z=(" + (isDef(this.in[2]) ? this.inValue[2] : 0) + ");" ;

            // MAKE SURE THE CODE IS VALID.

            var isError = false;
            try {
               var c = code;
               var i = c.indexOf("return ");
               if (i >= 0)
                  c = c.substring(0,i) + c.substring(i+7, c.length);
               eval(var_xyz + c);
            } catch (e) { isError = true; console.log("aha"); }

            // IF IT IS, SEND THE FUNCTION TO THE OUTPUT.

            this.audioShape = null;
            if (! isError) {
               var i = code.indexOf("return ");
               if (i < 0)
                  code = "return " + code;

               code = "return __audio__volume__ * (function(time) { " + code + " }(time))";

               var audioFunction = new Function("time", var_xyz + code);
               setAudioSignal(audioFunction);

               this.audioShape = [];

               for (var t = 0 ; t <= 1 ; t += .01)
                  this.audioShape.push([2*t-1, audioFunction(t/100)/TAU]);
            }
         }
         this.afterSketch(function() {
            if (this.audioShape != null) {
               lineWidth(1);
               mCurve(this.audioShape);
            }
         });
      }
   }
   IO.prototype = new Sketch;
   addSketchType("IO");

