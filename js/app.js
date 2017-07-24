/**
 * @author mrdoob / http://mrdoob.com/
 */

var APP = {

  Player: function() {

    var loader = new THREE.ObjectLoader();
    var camera,
      scene,
      renderer;

    var controls,
      effect,
      cameraVR,
      isVR;

    var events = {};

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    this.dom = document.createElement('div');

    this.width = 500;
    this.height = 500;

    this.load = function(json) {

      isVR = json.project.vr;

      renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      renderer.setClearColor(0x000000);
      renderer.setPixelRatio(window.devicePixelRatio);

      if (json.project.gammaInput)
        renderer.gammaInput = true;
      if (json.project.gammaOutput)
        renderer.gammaOutput = true;

      if (json.project.shadows) {

        renderer.shadowMap.enabled = true;
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      }

      this.dom.appendChild(renderer.domElement);

      this.setScene(loader.parse(json.scene));
      this.setCamera(loader.parse(json.camera));

      events = {
        init: [],
        start: [],
        stop: [],
        keydown: [],
        keyup: [],
        mousedown: [],
        mouseup: [],
        mousemove: [],
        touchstart: [],
        touchend: [],
        touchmove: [],
        update: []
      };

      var scriptWrapParams = 'player,renderer,scene,camera';
      var scriptWrapResultObj = {};

      for (var eventKey in events) {

        scriptWrapParams += ',' + eventKey;
        scriptWrapResultObj[eventKey] = eventKey;

      }

      var scriptWrapResult = JSON.stringify(scriptWrapResultObj).replace(/\"/g, '');

      for (var uuid in json.scripts) {

        var object = scene.getObjectByProperty('uuid', uuid, true);

        if (object === undefined) {

          console.warn('APP.Player: Script without object.', uuid);
          continue;

        }

        var scripts = json.scripts[uuid];

        for (var i = 0; i < scripts.length; i++) {

          var script = scripts[i];

          var functions = (new Function(scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';').bind(object))(this, renderer, scene, camera);

          for (var name in functions) {

            if (functions[name] === undefined) continue;

            if (events[name] === undefined) {

              console.warn('APP.Player: Event type not supported (', name, ')');
              continue;

            }

            events[name].push(functions[name].bind(object));

          }

        }

      }

      dispatch(events.init, arguments);

    };

    this.setCamera = function(value) {

      camera = value;
      camera.aspect = this.width / this.height;
      camera.updateProjectionMatrix();

      if (isVR === true) {

        cameraVR = new THREE.PerspectiveCamera();
        cameraVR.projectionMatrix = camera.projectionMatrix;
        camera.add(cameraVR);

        controls = new THREE.VRControls(cameraVR);
        effect = new THREE.VREffect(renderer);

        if (WEBVR.isAvailable() === true) {

          this.dom.appendChild(WEBVR.getButton(effect));

        }

        if (WEBVR.isLatestAvailable() === false) {

          this.dom.appendChild(WEBVR.getMessage());

        }

      }

    };

    this.setScene = function(value) {

      scene = value;

    };

    this.setSize = function(width, height) {

      this.width = width;
      this.height = height;

      if (camera) {

        camera.aspect = this.width / this.height;
        camera.updateProjectionMatrix();

      }

      if (renderer) {

        renderer.setSize(width, height);

      }

    };

    function dispatch(array, event) {

      for (var i = 0, l = array.length; i < l; i++) {

        array[i](event);

      }

    }

    var prevTime,
      request;

    function animate(time) {

      request = requestAnimationFrame(animate);

      try {

        dispatch(events.update, {
          time: time,
          delta: time - prevTime
        });

      } catch (e) {

        console.error((e.message || e), (e.stack || ""));

      }

      if (isVR === true) {

        camera.updateMatrixWorld();

        controls.update();
        effect.render(scene, cameraVR);

      } else {

        renderer.render(scene, camera);

      }

      prevTime = time;

    }

    this.play = function() {

      document.addEventListener('keydown', onDocumentKeyDown);
      document.addEventListener('keyup', onDocumentKeyUp);
      document.addEventListener('mousedown', onDocumentMouseDown);
      document.addEventListener('mouseup', onDocumentMouseUp);
      document.addEventListener('mousemove', onDocumentMouseMove);
      document.addEventListener('touchstart', onDocumentTouchStart);
      document.addEventListener('touchend', onDocumentTouchEnd);
      document.addEventListener('touchmove', onDocumentTouchMove);

      dispatch(events.start, arguments);

      request = requestAnimationFrame(animate);
      prevTime = performance.now();

    };

    this.stop = function() {

      document.removeEventListener('keydown', onDocumentKeyDown);
      document.removeEventListener('keyup', onDocumentKeyUp);
      document.removeEventListener('mousedown', onDocumentMouseDown);
      document.removeEventListener('mouseup', onDocumentMouseUp);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.removeEventListener('touchstart', onDocumentTouchStart);
      document.removeEventListener('touchend', onDocumentTouchEnd);
      document.removeEventListener('touchmove', onDocumentTouchMove);

      dispatch(events.stop, arguments);

      cancelAnimationFrame(request);

    };

    this.dispose = function() {

      while (this.dom.children.length) {

        this.dom.removeChild(this.dom.firstChild);

      }

      renderer.dispose();

      camera = undefined;
      scene = undefined;
      renderer = undefined;

    };

    //

    function onDocumentKeyDown(event) {

      dispatch(events.keydown, event);

    }

    function onDocumentKeyUp(event) {

      dispatch(events.keyup, event);

    }

    let clicked = false;

    const tableAnimation = new TimelineMax({
      paused: true
    });
    const cameraMovement = new TimelineMax({
      paused: true
    });


    function onDocumentMouseDown(event) {
      console.log(scene);
      const table = scene.children[1];
      const poten = table.children[0];
      const regelsBoven = table.children[1];
      const blad = table.children[2];
      const biskets = table.children[3];
      const regelsBeneden = table.children[4];
      const mounts = table.children[5];

      blad.children.forEach(function(element) {
        // console.log(element);
        // element.material.transparent = true;
        // element.material.opacity = 0.5;
      });

      if (!clicked) {
        tableAnimation.play();
        cameraMovement.play();
        clicked = !clicked;
      } else {
        tableAnimation.reverse();
        clicked = !clicked;
      }

      tableAnimation.to([blad.position, biskets.position], 4, {
        y: 12
      }, 'start')
        .to([regelsBoven.position, mounts.position], 2, {
          y: 8
        }, 'start+=0.5')
        .to(blad.children[0].position, 2, {
          x: 8
        }, 'start+=2')
        .to(blad.children[1].position, 2, {
          x: 4
        }, 'start+=2')
        .to(blad.children[3].position, 2, {
          x: -4
        }, 'start+=2')
        .to(blad.children[4].position, 2, {
          x: -8
        }, 'start+=2')
        .to(biskets.children[0].position, 2, {
          x: 2,
        }, 'start+=2')
        .to(biskets.children[1].position, 2, {
          x: -2,
        }, 'start+=2')
        .to(biskets.children[2].position, 2, {
          x: 6,
        }, 'start+=2')
        .to(biskets.children[3].position, 2, {
          x: -6,
        }, 'start+=2')
        .to(poten.children[0].position, 2, {
          x: -4,
          z: 4
        }, 'start+=1')
        .to(poten.children[1].position, 2, {
          x: 4,
          z: -4
        }, 'start+=1')
        .to(poten.children[2].position, 2, {
          x: -4,
          z: -4
        }, 'start+=1')
        .to(poten.children[3].position, 2, {
          x: 4,
          z: 4
        }, 'start+=1')
        .to(regelsBoven.children[0].position, 1, {
          x: 4,
        }, 'start+=3')
        .to(regelsBoven.children[1].position, 1, {
          z: -4,
        }, 'start+=3')
        .to(regelsBoven.children[2].position, 1, {
          z: 4,
        }, 'start+=3')
        .to(regelsBoven.children[3].position, 1, {
          x: -4,
        }, 'start+=3')

      cameraMovement.to(scene.rotation, 8, {
        y: 7
      })

      dispatch(events.mousedown, event);
    }

    function onDocumentMouseUp(event) {
      dispatch(events.mouseup, event);

    }

    let hoverElements;

    function onDocumentMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      let elements = scene.children[1].children[0].children;
      let intersects = raycaster.intersectObjects(elements);

      if (intersects.length > 0) {
        console.log(intersects)
      // intersects[0].object.material.transparent = true;
      // intersects[0].object.material.opacity = 0.5;
      // hoverElements = intersects[0];
      } else if (hoverElements != null) {
        // hoverElements.object.material.transparent = false;
        // hoverElements.object.material.opacity = 1;
      }

      dispatch(events.mousemove, event);

    }

    function onDocumentTouchStart(event) {

      dispatch(events.touchstart, event);

    }

    function onDocumentTouchEnd(event) {

      dispatch(events.touchend, event);

    }

    function onDocumentTouchMove(event) {

      dispatch(events.touchmove, event);

    }

  }

};
