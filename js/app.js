(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Action = require("./token.js").Action;
var Type = require("./typing.js").Type;

module.exports = [];

var aSetColor = function(ef, color) {
  Action.call(this, "setColor", arguments, [Type.ENTITYFILTER, Type.STRING]);

  this.args.push(ef);
  this.args.push(color);
};
aSetColor.prototype = new Action();

aSetColor.prototype.each = function(entity) {
  entity.setColor(this.args[1].evaluate());
};

aSetColor.prototype.constructor = aSetColor;
module.exports.push(aSetColor);


var aTorque = function(ef, strength) {
  Action.call(this, "applyTorque", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(strength);
};
aTorque.prototype = new Action();

aTorque.prototype.each = function(entity) {
  entity.body.SetAwake(1);
  entity.body.ApplyTorque(entity.getMass() * this.args[1].evaluate());
};

aTorque.prototype.constructor = aTorque;
module.exports.push(aTorque);


var aAngularImpulse = function(ef, strength) {
  Action.call(this, "applyAngularImpulse", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(strength);
};
aAngularImpulse.prototype = new Action();

aAngularImpulse.prototype.each = function(entity) {
  entity.body.SetAwake(1);
  entity.body.ApplyAngularImpulse(entity.getMass() * this.args[1].evaluate());
};

aAngularImpulse.prototype.constructor = aAngularImpulse;
module.exports.push(aAngularImpulse);


var aLinearVelocity = function(ef, x, y) {
  Action.call(this, "setLinearVelocity", arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
};
aLinearVelocity.prototype = new Action();

aLinearVelocity.prototype.each = function(entity) {
  entity.body.SetAwake(1);
  entity.setLinearVelocity(new b2Vec2(this.args[1].evaluate(), this.args[2].evaluate()));
};

aLinearVelocity.prototype.constructor = aLinearVelocity;
module.exports.push(aLinearVelocity);


var aLinearImpulse = function(ef, x, y) {
  Action.call(this, "applyLinearImpulse", arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
};
aLinearImpulse.prototype = new Action();

aLinearImpulse.prototype.each = function(entity) {
  entity.body.SetAwake(1);
  entity.applyLinearImpulse(new b2Vec2(entity.getMass() * this.args[1].evaluate(), entity.getMass() * this.args[2].evaluate()));
};

aLinearImpulse.prototype.constructor = aLinearImpulse;
module.exports.push(aLinearImpulse);


},{"./token.js":16,"./typing.js":20}],2:[function(require,module,exports){
var Behavior = function(logic, results) {
  this.logic = logic;
  this.results = Array.isArray(results) ? results : [results];
};

Behavior.prototype.check = function(entity) {
  return this.logic.evaluate(entity);
};

Behavior.prototype.toString = function() {
  return "Behavior(" + this.logic.toString() + ", " + this.results.toString() + ")";
};

Behavior.prototype.result = function() {
  for (var i = 0; i < this.results.length; i++) {
    this.results[i].execute();
  }
};

module.exports = Behavior;
},{}],3:[function(require,module,exports){
var FixType = require("./typing.js").FixType;
var Type = require("./typing.js").Type;

var BehaviorBuilder = function (tokenManager) {
  this.tokenManager = tokenManager;
};

BehaviorBuilder.prototype.initialize = function (type, container) {
  var btn = el("span.ui.button", {}, ["+"]);
  btn.type = type;

  btn.onclick = this.buildChoiceClick();

  $(container).html(btn);
};

BehaviorBuilder.prototype.buildChoiceClick = function () {
  var that = this;

  return function (e) {
    e.stopPropagation();

    that.buildChoice(that.tokenManager.getTokensByType(this.type), this);
  };
};

BehaviorBuilder.prototype.buildArgument = function (token, argIndex, argHolder) {
  // Builds an argument or argument placeholder. Returns false on bad literal input.

  if (token.args[argIndex] != undefined) {
    // Token in argument exists, build it
    
    if (token.argument_types[argIndex] === Type.LITERAL) {
      // Literals are dealt with and done

      $(argHolder).replaceWith(document.createTextNode(token.args[argIndex]));
      return true;
    }

    this.buildToken(token.args[argIndex], argHolder);
    return true;
  }
  else {
    // Argument is empty so far, add a button to create new

    if (token.argument_types[argIndex] === Type.LITERAL) {
      // Literals are dealt with and done

      token.populate();
      if (! token.validate())
        return false;

      $(argHolder).replaceWith(document.createTextNode(token.args[argIndex]));
      return true;
    }

    this.initialize(token.argument_types[argIndex], argHolder);
    return true;
  }
};

BehaviorBuilder.prototype.buildToken = function (token, holder) {
  var ret = el("span.token", {}, [el("span.name", {}, [token.name])]);

  ret.type = token.type;
  ret.onclick = this.buildChoiceClick();

  var argHolder;

  // Fix, so :hover triggers only on actual hovered token, not its ancestors
  ret.onmouseover = function (e) {
    e.stopPropagation();

    $(this).addClass("hover");
  };
  ret.onmouseout = function (e) {
    $(this).removeClass("hover");
  };

  if (token.fixType === FixType.PREFIX) {
    ret.appendChild(document.createTextNode("( "));

    var that = this;

    for (var index = 0; index < token.argument_types.length; index ++) {
      argHolder = el("span.argument");
      ret.appendChild(argHolder);

      if (! that.buildArgument(token, index, argHolder)) {
        return;
      }

      if (index !== token.argument_types.length - 1)
        ret.appendChild(document.createTextNode(", "));
    }

    ret.appendChild(document.createTextNode(" )"));
  }

  if (token.fixType === FixType.INFIX) {
    ret.insertBefore(document.createTextNode(" ) "), ret.firstChild);
    ret.appendChild(document.createTextNode(" ( "));

    argHolder = el("span");
    ret.insertBefore(argHolder, ret.firstChild);
    ret.insertBefore(document.createTextNode(" ( "), ret.firstChild);

    this.buildArgument(token, 0, argHolder);

    argHolder = el("span");
    ret.appendChild(argHolder);
    ret.appendChild(document.createTextNode(" ) "));

    this.buildArgument(token, 1, argHolder);
  }

  $(holder).replaceWith(ret);
};

BehaviorBuilder.prototype.buildChoice = function (tokens, holder) {
  $("div#tokenChoice").remove();
  var container = el("div#tokenChoice");
  var that = this;

  tokens.forEach(function (token) {
    var text = el("div.token", {}, [el("span.name", {}, [token.name])]);

    if (token.fixType === FixType.PREFIX)
      text.appendChild(el("span.argument", {}, ["( ", token.argument_types.join(", "), " )"]));

    if (token.fixType === FixType.INFIX) {
      text.insertBefore(el("span.argument", {}, ["( ", token.argument_types[0], " )"]), text.firstChild);
      text.appendChild(el("span.argument", {}, ["( ", token.argument_types[1], " )"]));
    }

    $(text).on("click", function (e) {
      that.buildToken(new token.constructor(), holder);
    });

    container.appendChild(text);
  });

  document.body.appendChild(container);

  $(document).one("click", function(e) {
    $("div#tokenChoice").remove();
  });

  var offset = 15;

  $(container).css("left", _engine.input.mouse.realX + offset + "px");
  $(container).css("top", _engine.input.mouse.realY + offset + "px");
};

module.exports = BehaviorBuilder;

},{"./typing.js":20}],4:[function(require,module,exports){
var BodyType = {
  DYNAMIC_BODY: Module.b2_dynamicBody,
  STATIC_BODY: Module.b2_staticBody,
  KINEMATIC_BODY: Module.b2_kinematicBody
};

module.exports = BodyType;
},{}],5:[function(require,module,exports){
var Constants = require("./constants.js");


var ClickableHelper = function (entity, width, height, position, image, move, click, release) {
  this.width = width;
  this.height = height;
  this.image = new Image();
  this.image.src = image;
  this.position = position;
  this.entity = entity;

  this.collisionGroup = Constants.COLLISION_GROUPS_NUMBER - 1;

  this.recalculatePosition();

  if (move == undefined) {
    move = function(){};
  }

  if (click == undefined) {
    click = function(){};
  }

  if (release == undefined) {
    release = function(){};
  }

  this.move = move.bind(this);
  this.click = function() {
    click.apply(this, arguments);
    $(document).one('mouseup', this.release);
    $(_engine.viewport.canvasElement).on('mousemove', this.move);
  };

  this.release = function () {
    release.apply(this, arguments);
    $(_engine.viewport.canvasElement).off('mousemove', this.move);
  };

  return this;
};

ClickableHelper.prototype.recalculatePosition = function () {
  var w = this.entity.getWidth();
  var h = this.entity.getHeight();

  this.x = (w / 2) * this.position[0];
  this.y = (h / 2) * this.position[1];

  if(this.fixture)
    this.entity.body.DestroyFixture(this.fixture);

  this.shape = new b2PolygonShape();
  this.shape.SetAsBox(
    _engine.viewport.toScale(this.width / 2),
    _engine.viewport.toScale(this.height / 2),
    new b2Vec2(this.x, this.y),
    0
  );

  this.fixture = new b2FixtureDef();
  this.fixture.set_shape(this.shape);

  var filterData = this.fixture.get_filter();
  filterData.set_categoryBits(1 << this.collisionGroup);
  filterData.set_maskBits(_engine.collisionGroups[this.collisionGroup].mask);
  this.fixture.set_filter(filterData);

  this.fixture = this.entity.body.CreateFixture(this.fixture);

};

ClickableHelper.prototype.testPoint = function (x, y) {
  return this.fixture.TestPoint(new b2Vec2(x, y));
};

ClickableHelper.prototype.draw = function (ctx) {
  ctx.drawImage(
    this.image,
    -this.width / 2,
    -this.height / 2,
    this.width,
    this.height
  );
};


module.exports = ClickableHelper;
},{"./constants.js":6}],6:[function(require,module,exports){
module.exports = {
  COLLISION_GROUPS_NUMBER: 16,
  LAYERS_NUMBER: 10,
  DEFAULT_SCALE: 1 / 70,
  AUTO_ID_PREFIX: "Entity ",
  SHAPE_MIN_SIZE: 0.2,
  TIME_STEP: 60,

  POSITION_TOP_LEFT: [-1, -1],
  POSITION_TOP: [0, -1],
  POSITION_TOP_RIGHT: [1, -1],
  POSITION_RIGHT: [1, 0],
  POSITION_BOTTOM_RIGHT: [1, 1],
  POSITION_BOTTOM: [0, 1],
  POSITION_BOTTOM_LEFT: [-1, 1],
  POSITION_LEFT: [-1, 0],

  sideOrder: [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
  ]
};
},{}],7:[function(require,module,exports){
var UI = require("./ui.js");
var Tools = require("./tools.js");
var TokenManager = require("./tokenmanager.js");
var Constants = require("./constants.js");

// ENGINE

// constructor

var Engine = function (viewport, gravity) {
  this.viewport = viewport;
  this.selectedEntity = null;
  this.selectedTool = Tools.Selection;

  this.helpers = [];

  this.bufferVec2 = new b2Vec2(0, 0);

  this.layers = new Array(Constants.LAYERS_NUMBER);
  for (var i = 0; i < Constants.LAYERS_NUMBER; i++) {
    this.layers[i] = [];
  }

  this.collisionGroups = [];
  for (var i = 0; i < Constants.COLLISION_GROUPS_NUMBER - 1; i++) {
    this.collisionGroups.push({
      "name": i + 1,
      "mask": parseInt("0" + Array(Constants.COLLISION_GROUPS_NUMBER).join("1"), 2)
    });
  }
  this.collisionGroups.push({
    "name": "Helpers",
    "mask": parseInt(Array(Constants.COLLISION_GROUPS_NUMBER + 1).join("0"), 2)
  });

  this.lifetimeEntities = 0;

  this.world = new b2World(gravity, true);
  this.world.paused = true;

  this.tokenManager = new TokenManager();

  var Input = require('./input.js');
  this.input = new Input(viewport);

  $(viewport.canvasElement).on("mousedown", (function () {
    this.selectedTool.onclick();
  }).bind(this));
  $(viewport.canvasElement).on("mouseup", (function () {
    this.selectedTool.onrelease();
  }).bind(this));
};

// Changes running state of the simulation
Engine.prototype.togglePause = function () {
  this.world.paused = !this.world.paused;
  this.selectEntity(null);

  this.selectTool(this.world.paused ? Tools.Selection : Tools.Blank);
  $("#selectionTool")[0].checked = true;

  if (!this.world.paused) {
    var entities = this.entities();

    entities.forEach(function (entity) {
      entity.body.SetAwake(1);
    });
  }
};

Engine.prototype.vec2 = function (x, y) {
  this.bufferVec2.set_x(x);
  this.bufferVec2.set_y(y);

  return this.bufferVec2;
};

Engine.prototype.selectTool = function (tool) {
  this.selectedTool = tool;
  this.selectEntity(null);
};

Engine.prototype.removeEntity = function (entity) {
  this.selectEntity(null);
  this.world.DestroyBody(entity.body);
  this.layers[entity.layer].splice(this.layers[entity.layer].indexOf(entity), 1);
};

Engine.prototype.setEntityLayer = function (entity, newLayer) {
  // Remove from old layer
  this.layers[entity.layer].splice(this.layers[entity.layer].indexOf(entity), 1);

  // Set new layer
  entity.layer = newLayer;
  this.layers[newLayer].push(entity);
};

// Returns all entities in one array
Engine.prototype.entities = function () {
  return [].concat.apply([], this.layers);
};


// Returns the entity with id specified by argument
Engine.prototype.getEntityById = function (id) {
  var entities = this.entities();

  for (var i = 0; i < entities.length; i++) {
    if (entities[i].id === id)
      return entities[i];
  }

  return null;
};

// Returns an array of entities with specified collisionGroup
Engine.prototype.getEntitiesByCollisionGroup = function (group) {
  var ret = [];
  var entities = this.entities();

  for (var i = 0; i < entities.length; i++) {
    if (entities[i].collisionGroup === group)
      ret.push(entities[i]);
  }

  return ret;
};

// Adding an entity to the world
Engine.prototype.addEntity = function (entity, type) {
  // generate auto id
  if (entity.id === undefined) {
    entity.id = Constants.AUTO_ID_PREFIX + this.lifetimeEntities;
  }

  this.lifetimeEntities++;

  entity.body.set_type(type);

  entity.body = this.world.CreateBody(entity.body);
  entity.fixture = entity.body.CreateFixture(entity.fixture);

  this.layers[entity.layer].push(entity);

  entity.addHelpers();

  return entity;
};

// Checks whether two groups should collide
Engine.prototype.getCollision = function (groupA, groupB) {
  return (this.collisionGroups[groupA].mask >> groupB) & 1;
};

// Sets two groups up to collide
Engine.prototype.setCollision = function (groupA, groupB, value) {
  var maskA = (1 << groupB);
  var maskB = (1 << groupA);

  if (value) {
    this.collisionGroups[groupA].mask = this.collisionGroups[groupA].mask | maskA;
    this.collisionGroups[groupB].mask = this.collisionGroups[groupB].mask | maskB;
  } else {
    this.collisionGroups[groupA].mask = this.collisionGroups[groupA].mask & ~maskA;
    this.collisionGroups[groupB].mask = this.collisionGroups[groupB].mask & ~maskB;
  }
  this.updateCollisions();

  return this;
};

// Changes the ID of an entity
Engine.prototype.changeId = function (entity, id) {
  entity.id = id;
};

// Selects an entity and shows its properties in the sidebar
Engine.prototype.selectEntity = function (entity) {
  this.selectedEntity = entity;

  UI.buildSidebar(this.selectedEntity);
};

// Updates collision masks for all entities, based on engine's collisionGroups table
Engine.prototype.updateCollisions = function () {
  var entities = this.entities();

  for (var i = 0; i < entities.length; i++) {
    this.updateCollision(entities[i]);
  }

  return this;
};

// Updates collision mask for an entity, based on engine's collisionGroups table
Engine.prototype.updateCollision = function (entity) {
  var filterData = entity.fixture.GetFilterData();
  filterData.set_maskBits(this.collisionGroups[entity.collisionGroup].mask);
  entity.fixture.SetFilterData(filterData);

  return this;
};

// One simulation step. Simulation logic happens here.
Engine.prototype.step = function () {
  // FPS timer
  var start = Date.now();

  ctx = this.viewport.context;

  // clear screen
  ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);

  ctx.save();

  if (!_engine.world.paused) {
    // box2d simulation step
    this.world.Step(1 / Constants.TIME_STEP, 10, 5);
  }
  else {
    this.selectedTool.onmove(ctx);
  }

  // draw all entities
  for (var layer = 0; layer < Constants.LAYERS_NUMBER; layer++) {
    for (var entity = this.layers[layer].length - 1; entity >= 0; entity--) {
      this.drawEntity(this.layers[layer][entity], ctx);
    }
  }

  if (this.selectedEntity) {
    this.drawBoundary(ctx);
    this.drawHelpers(this.selectedEntity, ctx);
  }

  // Released keys are only to be processed once
  this.input.cleanUp();

  var end = Date.now();

  // Call next step
  setTimeout(window.requestAnimationFrame(function () {
    _engine.step();
  }), Math.min(Constants.TIME_STEP - end - start, 0));
};

Engine.prototype.drawBoundary = function (ctx) {
  var halfWidth = this.selectedEntity.getWidth() / 2;
  var halfHeight = this.selectedEntity.getHeight() / 2;
  var x = this.selectedEntity.getX();
  var y = this.selectedEntity.getY();

  ctx.save();

  ctx.translate(
    this.viewport.fromScale(-this.viewport.x + x) + this.viewport.width / 2,
    this.viewport.fromScale(-this.viewport.y + y) + this.viewport.height / 2);

  ctx.rotate(this.selectedEntity.body.GetAngle());

  ctx.globalCompositeOperation = "xor";
  ctx.strokeRect(
    this.viewport.fromScale(-halfWidth),
    this.viewport.fromScale(-halfHeight),
    this.viewport.fromScale(2 * halfWidth),
    this.viewport.fromScale(2 * halfHeight)
  );

  ctx.restore();
};

Engine.prototype.drawHelpers = function (entity, ctx) {
  ctx.save();

  var entityX = entity.body.GetPosition().get_x();
  var entityY = entity.body.GetPosition().get_y();

  ctx.translate(
    this.viewport.fromScale(-this.viewport.x + entityX) + this.viewport.width / 2,
    this.viewport.fromScale(-this.viewport.y + entityY) + this.viewport.height / 2);
  ctx.rotate(entity.body.GetAngle());

  for (var i = 0; i < entity.helpers.length; i++) {
    ctx.save();

    var x = entity.helpers[i].x;
    var y = entity.helpers[i].y;

    ctx.translate(this.viewport.fromScale(x), this.viewport.fromScale(y));

    entity.helpers[i].draw(ctx);

    ctx.restore();
  }
  ctx.restore();
};

Engine.prototype.drawEntity = function (entity, ctx) {
  ctx.save();

  var x = entity.body.GetPosition().get_x();
  var y = entity.body.GetPosition().get_y();

  ctx.translate(
    this.viewport.fromScale(-this.viewport.x + x) + this.viewport.width / 2,
    this.viewport.fromScale(-this.viewport.y + y) + this.viewport.height / 2);

  ctx.rotate(entity.body.GetAngle());

  if (entity === this.selectedEntity)
    ctx.globalAlpha = 1;

  ctx.fillStyle = entity.color;
  entity.draw(ctx);

  ctx.restore();

  for (var j = 0; j < entity.behaviors.length; j++) {
    var behavior = entity.behaviors[j];

    if (behavior.check(entity))
      behavior.result();
  }
};


module.exports = Engine;



},{"./constants.js":6,"./input.js":12,"./tokenmanager.js":17,"./tools.js":18,"./ui.js":21}],8:[function(require,module,exports){
// ENTITY
var Utils = require("./utils.js");
var Constants = require("./constants.js");
var Geometry = require("./geometry.js");

var AUTO_COLOR_RANGE = [0, 230];

var Entity = function (shape, fixture, body, id, collisionGroup) {
  this.id = id;
  this.dead = false;
  this.layer = 0;
  this.helpers = [];

  this.fixedRotation = false;

  this.collisionGroup = collisionGroup;
  if (this.collisionGroup == undefined) {
    this.collisionGroup = 0;
  }

  this.behaviors = [];

  this.fixture = fixture;
  if (this.fixture == undefined) {
    var fix = new b2FixtureDef();
    fix.set_density(10);
    fix.set_friction(0.5);
    fix.set_restitution(0.2);

    this.fixture = fix;
  }
  this.fixture.set_shape(shape);

  var filterData = this.fixture.get_filter();
  filterData.set_categoryBits(1 << collisionGroup);

  // Constructor is called when inheriting, so we need to check for _engine availability
  if (typeof _engine !== 'undefined')
    filterData.set_maskBits(_engine.collisionGroups[this.collisionGroup].mask);

  this.fixture.set_filter(filterData);

  this.body = body;
  if (this.body !== undefined)
    this.body.set_fixedRotation(false);

  // Auto generate color
  var r = Utils.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]).toString(16);
  r = r.length == 1 ? "0" + r : r;
  var g = Utils.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]).toString(16);
  g = g.length == 1 ? "0" + g : g;
  var b = Utils.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]).toString(16);
  b = b.length == 1 ? "0" + b : b;
  this.color = "#" + r + g + b;
};

Entity.prototype.getX = function () {
  return this.body.GetPosition().get_x();
};

Entity.prototype.getY = function () {
  return this.body.GetPosition().get_y();
};

Entity.prototype.getWidth = function () {
  throw "ERROR! Cannot get width: Use derived class.";
};

Entity.prototype.getHeight = function () {
  throw "ERROR! Cannot get height: Use derived class.";
};

Entity.prototype.addHelpers = function () {
  throw "ERROR! Cannot add helpers: Use derived class.";
};

Entity.prototype.recalculateHelpers = function () {
  for (var i = 0; i < this.helpers.length; i++) {
    this.helpers[i].recalculatePosition();
  }
};

Entity.prototype.getSide = function (position) {
  var centerX = this.getX();
  var centerY = this.getY();
  var center = new b2Vec2(centerX, centerY);
  var width = this.getWidth();
  var height = this.getHeight();

  var rotation = Constants.sideOrder.equalIndexOf(position) * (Math.PI / 2);
  var topA = new b2Vec2(centerX - (width / 2), centerY - (height / 2));
  var topB = new b2Vec2(centerX + (width / 2), centerY - (height / 2));
  var a = Geometry.pointRotate(center, topA, rotation);
  var b = Geometry.pointRotate(center, topB, rotation);

  return [a, b];
};

Entity.prototype.die = function () {
  this.dead = true;

  return this;
};

Entity.prototype.draw = function () {
  throw "ERROR! Cannot draw Entity: Use derived classes.";
};

Entity.prototype.setColor = function (color) {
  this.color = color;

  return this;
};

Entity.prototype.setId = function (id) {
  this.id = id;

  return this;
};


Entity.prototype.setCollisionGroup = function (group) {
  this.collisionGroup = group;

  var filterData = this.fixture.GetFilterData();
  filterData.set_categoryBits(1 << group);
  this.fixture.SetFilterData(filterData);

  _engine.updateCollision(this);

  return this;
};

Entity.prototype.getLinearVelocity = function () {
  return this.body.GetLinearVelocity();
};

Entity.prototype.getMass = function () {
  return Math.max(1, this.body.GetMass());
};

Entity.prototype.setLinearVelocity = function (vector) {
  this.body.SetLinearVelocity(vector);

  return this;
};

Entity.prototype.applyTorque = function (force) {
  this.body.ApplyTorque(force);

  return this;
};

Entity.prototype.applyLinearImpulse = function (vector) {
  this.body.ApplyLinearImpulse(vector, this.body.GetWorldCenter());

  return this;
};

Entity.prototype.disableRotation = function (value) {
  this.fixedRotation = value;
  this.body.SetFixedRotation(value)

  return this;
};

Entity.prototype.addBehavior = function (behavior) {
  this.behaviors.push(behavior);

  return this;
};


module.exports = Entity;
},{"./constants.js":6,"./geometry.js":11,"./utils.js":23}],9:[function(require,module,exports){
var EntityFilter = require("./token.js").EntityFilter;
var Type = require("./typing.js").Type;

module.exports = [];

var efById = function(id) {
  EntityFilter.call(this, "filterById", arguments, [Type.STRING]);

  this.args.push(id);
};
efById.prototype = new EntityFilter();

efById.prototype.decide = function(entity) {
  return entity.id === this.args[0].evaluate();
};

efById.prototype.constructor = efById;
module.exports.push(efById);


var efByCollisionGroup = function(group) {
  EntityFilter.call(this, "filterByGroup", arguments, [Type.NUMBER]);

  this.args.push(group);
};
efByCollisionGroup.prototype = new EntityFilter();

efByCollisionGroup.prototype.decide = function(entity) {
  return entity.collisionGroup + 1 === this.args[0].evaluate();
};

efByCollisionGroup.prototype.constructor = efByCollisionGroup;
module.exports.push(efByCollisionGroup);


var efByLayer = function(layer) {
  EntityFilter.call(this, "filterByLayer", arguments, [Type.NUMBER]);

  this.args.push(layer);
};
efByLayer.prototype = new EntityFilter();

efByLayer.prototype.decide = function(entity) {
  return entity.layer + 1 === this.args[0].evaluate();
};

efByLayer.prototype.constructor = efByLayer;
module.exports.push(efByLayer);
},{"./token.js":16,"./typing.js":20}],10:[function(require,module,exports){
require("./translations.js");
require("./input.js");

var Engine = require("./engine.js");
var Viewport = require("./viewport.js");
var UI = require("./ui.js");
var BodyType = require("./bodytype.js");
var Behavior = require("./behavior.js");

var Circle = require("./shapes.js").Circle;
var Rectangle = require("./shapes.js").Rectangle;

UI.initialize();

window._engine = new Engine(new Viewport($("#mainCanvas")[0]), new b2Vec2(0, 10));


// _engine.addEntity(new Circle(new b2Vec2(0, 0), 2), BodyType.DYNAMIC_BODY)
_engine.addEntity(new Rectangle(new b2Vec2(0, 0), new b2Vec2(0.5, 0.5)), BodyType.DYNAMIC_BODY)
  .setCollisionGroup(2)
  .setId("kruh")
  .disableRotation(false)
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("(( getVelocityX( filterById( text( \"kruh\" ) ) ) ) > (number( \"-3\" ))) AND (isButtonDown( number( 37 ) ) )"),
      _engine.tokenManager.parser.parse("applyLinearImpulse( filterById( text( \"kruh\" ) ), number( -0.3 ), number( 0 ) )")
    )
  )
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("((getVelocityY( filterById( text( \"kruh\" ) ) )) > (number( -5 ))) AND (isButtonDown( number( 38 ) ))"),
      _engine.tokenManager.parser.parse("applyLinearImpulse( filterById( text( \"kruh\" ) ), number( 0 ), number( -0.5 ) )")
    )
  )
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("((getVelocityX( filterById( text( \"kruh\" ) ) )) < (number( 3 ))) AND (isButtonDown( number( 39 ) ))"),
      _engine.tokenManager.parser.parse("applyLinearImpulse( filterById( text( \"kruh\" ) ), number( 0.3 ), number( 0 ) )")
    )
  );

_engine.addEntity(new Rectangle(new b2Vec2(0, 3), new b2Vec2(2, 0.25)), BodyType.KINEMATIC_BODY)
  .setId("platform")
  .setCollisionGroup(1);

window.requestAnimationFrame(function() {
  _engine.step();
});
},{"./behavior.js":2,"./bodytype.js":4,"./engine.js":7,"./input.js":12,"./shapes.js":15,"./translations.js":19,"./ui.js":21,"./viewport.js":24}],11:[function(require,module,exports){
module.exports = {
  pointPointDistance: function (a, b) {
    return Math.sqrt(this.pointPointDistance2(a, b));
  },

  pointPointDistance2: function (a, b) {
    var x1 = a.get_x();
    var x2 = b.get_x();
    var y1 = a.get_y();
    var y2 = b.get_y();

    return this.square(x1 - x2) + this.square(y1 - y2);
  },

  square: function (x) {
    return x * x;
  },

  linePointDistance: function (lineA, lineB, point) {
    var length2 = this.pointPointDistance2(lineA, lineB);
    var xA = lineA.get_x();
    var xB = lineB.get_x();
    var xP = point.get_x();
    var yA = lineA.get_y();
    var yB = lineB.get_y();
    var yP = point.get_y();

    if (length2 === 0) return this.pointPointDistance2(point, lineA);

    var t = ((xP - xA) * (xB - xA) + (yP - yA) * (yB - yA)) / length2;
    t = Math.max(0, Math.min(1, t));

    return this.pointPointDistance(point, new b2Vec2(xA + t * (xB - xA), yA + t * (yB - yA)));
  },

  pointRotate: function (origin, point, angle) {
    angle = -angle; // Cartesian to screen coordinate system
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var ox = origin.get_x();
    var oy = origin.get_y();
    var x = point.get_x();
    var y = point.get_y();

    return new b2Vec2(
      (cos * (x - ox)) + (sin * (y - oy)) + ox,
      (cos * (y - oy)) - (sin * (x - ox)) + oy
    );
  },

  findAngle: function (pointA, pointB, center) {
    var xA = pointA.get_x();
    var xB = pointB.get_x();
    var xC = center.get_x();
    var yA = pointA.get_y();
    var yB = pointB.get_y();
    var yC = center.get_y();

    var AC = Math.sqrt(Math.pow(xC - xA, 2) + Math.pow(yC - yA, 2));
    var CB = Math.sqrt(Math.pow(xC - xB, 2) + Math.pow(yC - yB, 2));
    var AB = Math.sqrt(Math.pow(xB - xA, 2) + Math.pow(yB - yA, 2));

    return Math.acos((CB * CB + AC * AC - AB * AB) / (2 * CB * AC));
  }

};
},{}],12:[function(require,module,exports){
// INPUT CAPTURING

var Input = function(viewport) {
  "use strict";

  this.viewport = viewport;

  this.mouse = {
    x: 0,
    y: 0,
    canvasX: 0,
    canvasY: 0,
    realX: 0,
    realY: 0,
    leftDown: false,
    rightDown: false,
    leftUp: false,
    rightUp: false,
  };

  this.keyboard = {
    down: new Set(),
    up: new Set(),

    isDown: function (keyCode) {
      return this.down.has(keyCode);
    },

    isUp: function (keyCode) {
      return this.up.has(keyCode);
    },
  };

  document.addEventListener('mousemove', this.updateMousePosition.bind(this));
  document.addEventListener('mousedown', this.updateMouseButtonsDown.bind(this));
  document.addEventListener('mouseup', this.updateMouseButtonsUp.bind(this));
  document.addEventListener('keydown', this.updateKeyboardButtonsDown.bind(this));
  document.addEventListener('keyup', this.updateKeyboardButtonsUp.bind(this));

  document.onselectstart = function () {
    return false;
  };
};

Input.prototype.cleanUp = function () {
  this.mouse.leftUp = false;
  this.mouse.rightUp = false;

  this.keyboard.up.clear();
};

Input.prototype.updateMousePosition = function (event) {
  this.mouse.canvasX = event.pageX - this.viewport.canvasElement.getBoundingClientRect().left;
  this.mouse.canvasY = event.pageY - this.viewport.canvasElement.getBoundingClientRect().top;
  this.mouse.x = this.viewport.toScale(this.mouse.canvasX) + this.viewport.x - this.viewport.toScale(this.viewport.width) / 2;
  this.mouse.y = this.viewport.toScale(this.mouse.canvasY) + this.viewport.y - this.viewport.toScale(this.viewport.height) / 2;
  this.mouse.realX = event.pageX;
  this.mouse.realY = event.pageY;
};

Input.prototype.updateMouseButtonsDown = function (event) {
  if (event.which === 1)
    this.mouse.leftDown = true;

  if (event.which === 3)
    this.mouse.rightDown = true;
};

Input.prototype.updateMouseButtonsUp = function (event) {
  if (event.which === 1) {
    this.mouse.leftDown = false;
    this.mouse.leftUp = true;
  }

  if (event.which === 3) {
    this.mouse.rightDown = false;
    this.mouse.rightUp = true;
  }
};

Input.prototype.updateKeyboardButtonsDown = function (event) {
  this.keyboard.down.add(event.which);

  if(event.which === 32)
    event.preventDefault();
};

Input.prototype.updateKeyboardButtonsUp = function (event) {
  this.keyboard.down.delete(event.which);
  this.keyboard.up.add(event.which);
};

module.exports = Input;
},{}],13:[function(require,module,exports){
var Logic = require("./token.js").Logic;
var Translations = require("./translations.js");
var Literal = require("./token.js").Literal;
var Type = require("./typing.js").Type;
var FixType = require("./typing.js").FixType;

module.exports = [];

var lAnd = function (a, b) {
  Logic.call(this, "AND", Type.BOOLEAN, arguments, [Type.BOOLEAN, Type.BOOLEAN]);

  this.fixType = FixType.INFIX;

  this.args.push(a);
  this.args.push(b);
};
lAnd.prototype = new Logic();

lAnd.prototype.evaluate = function () {
  return (this.args[0].evaluate() && this.args[1].evaluate());
};

lAnd.prototype.constructor = lAnd;
module.exports.push(lAnd);


var lOr = function (a, b) {
  Logic.call(this, "OR", Type.BOOLEAN, arguments, [Type.BOOLEAN, Type.BOOLEAN]);

  this.fixType = FixType.INFIX;

  this.args.push(a);
  this.args.push(b);
};
lOr.prototype = new Logic();

lOr.prototype.evaluate = function () {
  if (this.args[0].evaluate() || this.args[1].evaluate())
    return true;

  return false;
};

lOr.prototype.constructor = lOr;
module.exports.push(lOr);


var lNot = function (a) {
  Logic.call(this, "NOT", Type.BOOLEAN, arguments, [Type.BOOLEAN]);

  this.args.push(a);
};
lNot.prototype = new Logic();

lNot.prototype.evaluate = function () {
  return !this.args[0].evaluate();
};

lNot.prototype.constructor = lNot;
module.exports.push(lNot);


var lString = function (value) {
  Logic.call(this, "text", Type.STRING, arguments, [Type.LITERAL]);

  this.args.push(value);
};
lString.prototype = new Logic();

lString.prototype.evaluate = function () {
  return this.args[0].evaluate();
};

lString.prototype.validate = function () {
  return true;
};

lString.prototype.populate = function () {
  this.args[0] = new Literal(prompt(Translations.getTranslated("BEHAVIORS.INPUT_DIALOG") + this.name));
};

lString.prototype.constructor = lString;
module.exports.push(lString);


var lNumber = function (value) {
  Logic.call(this, "number", Type.NUMBER, arguments, [Type.LITERAL]);

  this.args.push(value);
};
lNumber.prototype = new Logic();

lNumber.prototype.evaluate = function () {
  return parseFloat(this.args[0].evaluate());
};

lNumber.prototype.validate = function () {
  return $.isNumeric(this.args[0].evaluate());
};

lNumber.prototype.populate = function () {
  this.args[0] = new Literal(prompt(Translations.getTranslated(BEHAVIORS.INPUT_DIALOG) + this.name));
};

lNumber.prototype.constructor = lNumber;
module.exports.push(lNumber);


var lTrue = function () {
  Logic.call(this, "true", Type.BOOLEAN, arguments, []);
};
lTrue.prototype = new Logic();

lTrue.prototype.evaluate = function () {
  return true;
};

lTrue.prototype.constructor = lTrue;
module.exports.push(lTrue);


var lFalse = function (value) {
  Logic.call(this, "false", Type.BOOLEAN, arguments, []);
};
lFalse.prototype = new Logic();

lFalse.prototype.evaluate = function () {
  return false;
};

lFalse.prototype.constructor = lFalse;
module.exports.push(lFalse);


var lButtonDown = function (button) {
  Logic.call(this, "isButtonDown", Type.BOOLEAN, arguments, [Type.NUMBER]);

  this.args.push(button);
};
lButtonDown.prototype = new Logic();

lButtonDown.prototype.evaluate = function () {
  return _engine.input.keyboard.isDown(this.args[0].evaluate());
};

lButtonDown.prototype.constructor = lButtonDown;
module.exports.push(lButtonDown);


var lButtonUp = function (button) {
  Logic.call(this, "isButtonUp", Type.BOOLEAN, arguments, [Type.NUMBER]);

  this.args.push(button);
};
lButtonUp.prototype = new Logic();

lButtonUp.prototype.evaluate = function () {
  return _engine.input.keyboard.isUp(this.args[0].evaluate());
};

lButtonUp.prototype.constructor = lButtonUp;
module.exports.push(lButtonUp);


var lRandom = function (min, max) {
  Logic.call(this, "randomNumber", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(min);
  this.args.push(max);
};
lRandom.prototype = new Logic();

lRandom.prototype.evaluate = function () {
  return Utils.randomRange(this.args[0].evaluate() && this.args[1].evaluate());
};

lRandom.prototype.constructor = lRandom;
module.exports.push(lRandom);


var lVelocityX = function (ef) {
  Logic.call(this, "getVelocityX", Type.NUMBER, arguments, [Type.ENTITYFILTER]);

  this.args.push(ef);
};
lVelocityX.prototype = new Logic();

lVelocityX.prototype.evaluate = function () {
  var entity = this.args[0].filter()[0];

  return entity.body.GetLinearVelocity().get_x();
};

lVelocityX.prototype.constructor = lVelocityX;
module.exports.push(lVelocityX);


var lVelocityY = function (ef) {
  Logic.call(this, "getVelocityY", Type.NUMBER, arguments, [Type.ENTITYFILTER]);

  this.args.push(ef);
};
lVelocityY.prototype = new Logic();

lVelocityY.prototype.evaluate = function () {
  var entity = this.args[0].filter()[0];

  return entity.body.GetLinearVelocity().get_y();
};

lVelocityY.prototype.constructor = lVelocityY;
module.exports.push(lVelocityY);


var lPlus = function (a, b) {
  Logic.call(this, "+", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lPlus.prototype = new Logic();

lPlus.prototype.evaluate = function () {
  return this.args[0].evaluate() + this.args[1].evaluate();
};

lPlus.prototype.constructor = lPlus;
module.exports.push(lPlus);


var lMultiply = function (a, b) {
  Logic.call(this, "*", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lMultiply.prototype = new Logic();

lMultiply.prototype.evaluate = function () {
  return this.args[0].evaluate() * this.args[1].evaluate();
};

lMultiply.prototype.constructor = lMultiply;
module.exports.push(lMultiply);


var lDivide = function (a, b) {
  Logic.call(this, "/", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lDivide.prototype = new Logic();

lDivide.prototype.evaluate = function () {
  return this.args[0].evaluate() / this.args[1].evaluate();
};

lDivide.prototype.constructor = lDivide;
module.exports.push(lDivide);


var lMinus = function (a, b) {
  Logic.call(this, "-", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lMinus.prototype = new Logic();

lMinus.prototype.evaluate = function () {
  return this.args[0].evaluate() + this.args[1].evaluate();
};

lMinus.prototype.constructor = lMinus;
module.exports.push(lMinus);


var lGreater = function (a, b) {
  Logic.call(this, ">", Type.BOOLEAN, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lGreater.prototype = new Logic();

lGreater.prototype.evaluate = function () {
  return this.args[0].evaluate() > this.args[1].evaluate();
};

lGreater.prototype.constructor = lGreater;
module.exports.push(lGreater);


var lLesser = function (a, b) {
  Logic.call(this, "<", Type.BOOLEAN, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lLesser.prototype = new Logic();

lLesser.prototype.evaluate = function () {
  return this.args[0].evaluate() < this.args[1].evaluate();
};

lLesser.prototype.constructor = lLesser;
module.exports.push(lLesser);



},{"./token.js":16,"./translations.js":19,"./typing.js":20}],14:[function(require,module,exports){
var FixType = require("./typing").FixType;
var Type = require("./typing").Type;
var Literal = require("./token.js").Literal;


var Parser = function (tokenManager) {
  this.tokenManager = tokenManager;

  this.parserInput = "";
  this.parserInputWhole = "";
  this.parserStack = [];
};

Parser.prototype.fail = function (message) {
  throw message + "\nRemaining input: " + this.parserInput;
};

Parser.prototype.currentChar = function() {
  return this.parserInput.length ? this.parserInput[0] : "";
};

Parser.prototype.nextChar = function () {
  return this.parserInput[1];
};

Parser.prototype.removeChar = function () {
  this.parserInput = this.parserInput.slice(1);
};

Parser.prototype.readChar = function() {
  var ret = this.currentChar();

  this.removeChar();

  return ret;
};

Parser.prototype.readWhitespace = function () {
  while (this.currentChar() === " ")
    this.removeChar();
};

Parser.prototype.readName = function () {
  this.readWhitespace();

  var ret = "";

  while(/[^ ,)("]/.test(this.currentChar()))
    ret += this.readChar();

  if (this.currentChar() === '"') {
    this.readChar();

    while (this.currentChar() !== '"') {
      if (this.currentChar() === "\\" && this.nextChar() === "\"") {
        this.readChar();
        this.readChar();

        ret += "\"";
      }

      else
        ret += this.readChar();
    }

    this.readChar();
  }

  this.readWhitespace();

  return ret;
};

Parser.prototype.readParentheses = function () {
  this.readWhitespace();

  if (this.currentChar() !== "(")
    return;

  this.readChar();

  while (this.currentChar() !== ")"){
    this.readWhitespace();

    this.parseToken();

    this.readWhitespace();

    if (this.currentChar() === ",") {
      this.readChar();
      this.readWhitespace();
    }
  }

  this.readChar();
};

Parser.prototype.parseToken = function () {
  this.readParentheses();

  var name = this.readName();
  var token = this.tokenManager.getTokenByName(name);
  token = token === undefined ? new Literal(name) : new token.constructor();

  this.readParentheses();

  if (token.type !== Type.LITERAL)
  {
    for(var i = token.argument_types.length - 1; i >= 0; i--) {
      var arg = this.parserStack.pop();

      if ((token.argument_types[i] !== arg.type))
        this.fail("Expected " + token.argument_types[i] + ", got " + arg.type);
      
      token.args[i] = arg;
    }
  }

  this.parserStack.push(token);

  return token;
};

Parser.prototype.parse = function (input) {
  this.parserInput = input;
  this.parserInputWhole = input;
  this.parserStack = [];

  return this.parseToken();
};


module.exports = Parser;
},{"./token.js":16,"./typing":20}],15:[function(require,module,exports){
var Entity = require("./entity.js");
var Constants = require("./constants.js");
var ClickableHelper = require("./clickablehelper.js");
var Geometry = require("./geometry.js");

// Circle entity
var Circle = function (center, radius, fixture, id, collisionGroup) {
  var shape = new b2CircleShape();
  shape.set_m_radius(radius);

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.radius = radius;

  this.nameString = "CIRCLE";

  return this;
};
Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.getWidth = function () {
  return this.radius * 2;
};

Circle.prototype.getHeight = function () {
  return this.radius * 2;
};

Circle.prototype.addHelpers = function () {
  this.helpers = [
    new ClickableHelper(this, 15, 15, Constants.POSITION_TOP_RIGHT, 'img/resize-sw-ne.svg', this.moveResize, this.startResize),
  ];
};

Circle.prototype.draw = function (ctx) {
  ctx.beginPath();

  ctx.arc(0, 0, _engine.viewport.fromScale(this.radius), 0, 2 * Math.PI, false);

  ctx.fill();

  ctx.strokeStyle = "red";
  ctx.globalCompositeOperation = "destination-out";

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, _engine.viewport.fromScale(this.radius));
  ctx.stroke();
  ctx.closePath();
};

Circle.prototype.startResize = function () {
  this.startSize = this.entity.getWidth() / 2;

  this.startDistance = Geometry.pointPointDistance(
    new b2Vec2(this.entity.getX(), this.entity.getY()),

    new b2Vec2(
      _engine.input.mouse.x,
      _engine.input.mouse.y
    )
  );
};

Circle.prototype.moveResize = function () {
  var scale = Geometry.pointPointDistance(
      new b2Vec2(this.entity.getX(), this.entity.getY()),

      new b2Vec2(
        _engine.input.mouse.x,
        _engine.input.mouse.y
      )
    ) / this.startDistance;

  this.entity.resize(this.startSize * scale);
};

Circle.prototype.resize = function (radius) {
  if (radius < Constants.SHAPE_MIN_SIZE / 2)
    return false;

  var newFix = new b2FixtureDef();
  newFix.set_density(this.fixture.GetDensity());
  newFix.set_friction(this.fixture.GetFriction());
  newFix.set_restitution(this.fixture.GetRestitution());
  newFix.set_filter(this.fixture.GetFilterData());

  var shape = new b2CircleShape();
  shape.set_m_radius(radius);
  this.radius = radius;

  newFix.set_shape(shape);

  this.body.DestroyFixture(this.fixture);
  this.fixture = this.body.CreateFixture(newFix);

  this.recalculateHelpers();

  if (this === _engine.selectedEntity) {
    $("#entity_width").val(radius * 2);
    $("#entity_height").val(radius * 2);
  }

  return true;
};


// Rectangle entity
var Rectangle = function (center, extents, fixture, id, collisionGroup) {
  var shape = new b2PolygonShape();
  shape.SetAsBox(extents.get_x(), extents.get_y());

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.extents = extents;

  this.nameString = "RECTANGLE";

  return this;
};
Rectangle.prototype = new Entity();
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.getWidth = function () {
  return this.extents.get_x() * 2;
};

Rectangle.prototype.getHeight = function () {
  return this.extents.get_y() * 2;
};

Rectangle.prototype.addHelpers = function () {
  this.helpers = [
    new ClickableHelper(this, 15, 15, Constants.POSITION_TOP_RIGHT, 'img/resize-sw-ne.svg', this.moveResize, this.startResize),
    new ClickableHelper(this, 7, 7, Constants.POSITION_BOTTOM, 'img/handle.svg', this.moveResizeSide, this.startResizeSide),
    new ClickableHelper(this, 7, 7, Constants.POSITION_TOP, 'img/handle.svg', this.moveResizeSide, this.startResizeSide),
    new ClickableHelper(this, 7, 7, Constants.POSITION_LEFT, 'img/handle.svg', this.moveResizeSide, this.startResizeSide),
    new ClickableHelper(this, 7, 7, Constants.POSITION_RIGHT, 'img/handle.svg', this.moveResizeSide, this.startResizeSide),
  ];
};

Rectangle.prototype.draw = function (ctx) {
  var halfWidth = _engine.viewport.fromScale(this.extents.get_x());
  var halfHeight = _engine.viewport.fromScale(this.extents.get_y());

  ctx.fillRect(-halfWidth, -halfHeight, halfWidth * 2, halfHeight * 2);
};

Rectangle.prototype.startResizeSide = function () {
  this.startSize = [
    this.entity.getWidth() / 2,
    this.entity.getHeight() / 2
  ];

  this.startPosition = new b2Vec2(
    this.entity.getX(),
    this.entity.getY()
  );
};

Rectangle.prototype.moveResizeSide = function () {
  var mouseRotated = Geometry.pointRotate(
    this.startPosition,
    new b2Vec2(_engine.input.mouse.x, _engine.input.mouse.y),
    -(this.entity.body.GetAngle() + Constants.sideOrder.equalIndexOf(this.position) * (Math.PI / 2))
  );

  var distance = this.startPosition.get_y() - mouseRotated.get_y();

  if (this.entity.resize(
      (this.startSize[0] + this.startSize[0] * Math.abs(this.position[1]) + distance * Math.abs(this.position[0])) / 2,
      (this.startSize[1] + this.startSize[1] * Math.abs(this.position[0]) + distance * Math.abs(this.position[1])) / 2
    )) {

    this.entity.body.SetTransform(
      Geometry.pointRotate(
        this.startPosition,
        new b2Vec2(
          this.startPosition.get_x() + ((distance - this.startSize[0]) / 2) * this.position[0],
          this.startPosition.get_y() + ((distance - this.startSize[1]) / 2) * this.position[1]
        ),
        this.entity.body.GetAngle()
      ),

      this.entity.body.GetAngle()
    );

  }
};

Rectangle.prototype.startResize = function () {
  this.startSize = [
    this.entity.getWidth() / 2,
    this.entity.getHeight() / 2
  ];

  this.startDistance = Geometry.pointPointDistance(
    this.entity.body.GetPosition(),

    new b2Vec2(
      _engine.input.mouse.x,
      _engine.input.mouse.y
    )
  );
};

Rectangle.prototype.moveResize = function () {
  var scale = Geometry.pointPointDistance(
      this.entity.body.GetPosition(),

      new b2Vec2(
        _engine.input.mouse.x,
        _engine.input.mouse.y
      )
    ) / this.startDistance;

  this.entity.resize(this.startSize[0] * scale, this.startSize[1] * scale);
};

Rectangle.prototype.resize = function (halfWidth, halfHeight) {
  if (
    halfWidth * 2 < Constants.SHAPE_MIN_SIZE ||
    halfHeight * 2 < Constants.SHAPE_MIN_SIZE
  )
    return false;

  var newFix = new b2FixtureDef();
  newFix.set_density(this.fixture.GetDensity());
  newFix.set_friction(this.fixture.GetFriction());
  newFix.set_restitution(this.fixture.GetRestitution());
  newFix.set_filter(this.fixture.GetFilterData());

  var shape = new b2PolygonShape();
  shape.SetAsBox(halfWidth, halfHeight);
  this.extents = new b2Vec2(halfWidth, halfHeight);

  newFix.set_shape(shape);

  this.body.DestroyFixture(this.fixture);
  this.fixture = this.body.CreateFixture(newFix);

  this.recalculateHelpers();

  if (this === _engine.selectedEntity) {
    $("#entity_width").val(halfWidth * 2);
    $("#entity_height").val(halfHeight * 2);
  }

  return true;
};


module.exports.Circle = Circle;
module.exports.Rectangle = Rectangle;
},{"./clickablehelper.js":5,"./constants.js":6,"./entity.js":8,"./geometry.js":11}],16:[function(require,module,exports){
var FixType = require("./typing.js").FixType;
var Type = require("./typing.js").Type;

var Token = function(name, type, args, argument_types) {
  this.type = type;
  this.fixType = FixType.PREFIX;
  this.name = name;
  this.args = args == undefined ? [] : args;
  this.argument_types = argument_types;
  this.args = [];
};

Token.prototype.toString = function() {
  var ret = "";
  var argStrings = [];

  for (var i = 0; i < this.args.length; i++) {
    argStrings.push(this.args[i].toString());
  }

  argStrings = argStrings.join(", ");

  switch (this.fixType) {
    case FixType.PREFIX:
      ret = this.name + "(" + argStrings + ")";
      break;
    case FixType.INFIX:
      ret = "(" + this.args[0].toString() + ")" + this.name + "(" + this.args[1].toString() + ")";
      break;
  }

  return ret;
};


var Literal = function(value) {
  this.type = Type.LITERAL;
  this.value = value;
};

Literal.prototype.toString = function () {
  return '"' + this.value + '"';
};

Literal.prototype.evaluate = function () {
  return this.value;
};


var Logic = function(name, type, args, argument_types) {
  Token.call(this, name, type, args, argument_types);
};
Logic.prototype = new Token();
Logic.prototype.constructor = Logic;

Logic.prototype.evaluate = function() { // Use a derived class
  return false;
};


var Action = function(name, args, argument_types) {
  Token.call(this, name, Type.ACTION, args, argument_types);
};
Action.prototype = new Token();
Action.prototype.constructor = Action;

Action.prototype.each = function(entity) { // Use a derived class
  return false;
};

Action.prototype.execute = function() {
  var entities = this.args[0].filter();
  for (var i = 0; i < entities.length; i++) {
    this.each(entities[i]);
  }
};


var EntityFilter = function(name, args, argument_types) {
  Token.call(this, name, Type.ENTITYFILTER, args, argument_types);
};
EntityFilter.prototype = new Token();
EntityFilter.prototype.constructor = EntityFilter;

EntityFilter.prototype.decide = function(entity) { // Use derived class
  return false;
};

EntityFilter.prototype.filter = function() {
  var ret = [];
  var entities = _engine.entities();
  
  for (var i = 0; i < entities.length; i++) {
    if (this.decide(entities[i]))
      ret.push(entities[i]);
  }
  return ret;
};

module.exports.Token = Token;
module.exports.Literal = Literal;
module.exports.Action = Action;
module.exports.Logic = Logic;
module.exports.EntityFilter = EntityFilter;

// TODO: linear action, porovnavanie, uhly, plus, minus , deleno, krat, x na n
},{"./typing.js":20}],17:[function(require,module,exports){
var Parser = require("./parser.js");

var TokenManager = function () {
  this.tokens = [];

  this.registerTokens(require("./logic.js"));
  this.registerTokens(require("./actions.js"));
  this.registerTokens(require("./entityfilters.js"));

  this.parser = new Parser(this);
};

TokenManager.prototype.registerTokens = function (tokens) {
  tokens.forEach(function (token) {
    this.tokens.push(new token());
  }, this);
};

TokenManager.prototype.getTokenByName = function (name) {
  for (var i = 0; i < this.tokens.length; i++)
  {
    if (this.tokens[i].name === name)
      return this.tokens[i];
  }
};

TokenManager.prototype.getTokensByType = function (type) {
  var ret = [];

  this.tokens.forEach(function (token) {
    if (token.type === type)
      ret.push(token);
  });

  return ret;
};

module.exports = TokenManager;
},{"./actions.js":1,"./entityfilters.js":9,"./logic.js":13,"./parser.js":14}],18:[function(require,module,exports){
var Shape = require("./shapes.js");
var Type = require("./bodytype.js");
var Constants = require("./constants.js");

var Blank = {
  onclick: function () {},
  onrelease: function () {},
  onmove: function () {}
};


var Selection = {
  origin: null,
  offset: null,
  mode: null,

  onclick: function () {

    if(_engine.selectedEntity) {
      for (var i = 0; i < _engine.selectedEntity.helpers.length; i++) {
        if (_engine.selectedEntity.helpers[i].testPoint(_engine.input.mouse.x, _engine.input.mouse.y)) {
          _engine.selectedEntity.helpers[i].click();
          return;
        }
      }
    }

    _engine.selectEntity(null);

    for (var i = Constants.LAYERS_NUMBER - 1; i >= 0; i--) {
      for (var j = 0; j < _engine.layers[i].length; j++) {
        if (_engine.layers[i][j].fixture.TestPoint(
            new b2Vec2(_engine.input.mouse.x, _engine.input.mouse.y))
        ) {
          _engine.selectEntity(_engine.layers[i][j]);

          this.origin = [_engine.input.mouse.x, _engine.input.mouse.y];
          this.offset = [
            _engine.selectedEntity.body.GetPosition().get_x() - this.origin[0],
            _engine.selectedEntity.body.GetPosition().get_y() - this.origin[1]
          ];

          this.mode = "reposition";
          this.origin = [_engine.input.mouse.x, _engine.input.mouse.y];

          return;
        }
      }
    }

    this.mode = "camera";

    this.origin = [_engine.viewport.x, _engine.viewport.y];
    this.offset = [_engine.input.mouse.canvasX, _engine.input.mouse.canvasY];
    _engine.viewport.canvasElement.style.cursor = "url(img/grabbingcursor.png), move";
  },
  onrelease: function () {
    this.origin = this.offset = this.mode = null;
    _engine.viewport.canvasElement.style.cursor = "default";
  },
  onmove: function () {
    if (this.mode === null)
      return;

    if (this.mode === "camera") {
      _engine.viewport.x = this.origin[0] + _engine.viewport.toScale(this.offset[0] - _engine.input.mouse.canvasX);
      _engine.viewport.y = this.origin[1] + _engine.viewport.toScale(this.offset[1] - _engine.input.mouse.canvasY);
    }

    if (this.mode === "reposition") {
      var body = _engine.selectedEntity.body;
      var x = Math.round((_engine.input.mouse.x + this.offset[0]) * 1000) / 1000;
      var y = Math.round((_engine.input.mouse.y + this.offset[1]) * 1000) / 1000;

      body.SetTransform(new b2Vec2(x, y), body.GetAngle());
      $("#entity_x").val(x);
      $("#entity_y").val(y);
    }
  }
};


var Rectangle = {
  origin: null,
  worldOrigin: null,
  w: 0,
  h: 0,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [_engine.input.mouse.canvasX, _engine.input.mouse.canvasY];
    this.worldOrigin = [_engine.input.mouse.x, _engine.input.mouse.y];
  },

  onrelease: function () {
    if (
      this.w >= _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE) &&
      this.h >= _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE)
    ) {
      this.w *= _engine.viewport.scale;
      this.h *= _engine.viewport.scale;

      _engine.addEntity(new Shape.Rectangle(
        new b2Vec2(this.worldOrigin[0] + this.w / 2, this.worldOrigin[1] + this.h / 2),
        new b2Vec2(this.w / 2, this.h / 2)), Type.DYNAMIC_BODY);
    }

    this.onmove = function(){};
    this.origin = null;
    this.worldOrigin = null;
    this.w = this.h = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.w = _engine.input.mouse.canvasX - this.origin[0];
    this.h = _engine.input.mouse.canvasY - this.origin[1];

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    if (
      this.w < _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE) ||
      this.h < _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE)
    ) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
    }
    ctx.save();
    ctx.fillRect(this.origin[0], this.origin[1], this.w, this.h);
    ctx.restore();
  }
};


var Circle = {
  origin: null,
  worldOrigin: null,
  radius: 0,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [_engine.input.mouse.canvasX, _engine.input.mouse.canvasY];
    this.worldOrigin = [_engine.input.mouse.x, _engine.input.mouse.y];
  },

  onrelease: function () {
    if (this.radius >= _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE) / 2) {
      this.radius *= _engine.viewport.scale;

      _engine.addEntity(new Shape.Circle(
        new b2Vec2(this.worldOrigin[0] + this.radius, this.worldOrigin[1] + this.radius),
        this.radius), Type.DYNAMIC_BODY);
    }

    this.onmove = function(){};
    this.origin = null;
    this.worldOrigin = null;
    this.radius = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.radius = Math.min(_engine.input.mouse.canvasX - this.origin[0], _engine.input.mouse.canvasY - this.origin[1]) / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";

    if (this.radius < _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE) / 2) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
    }

    ctx.save();

    ctx.beginPath();

    ctx.arc(this.origin[0] + this.radius, this.origin[1] + this.radius, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.restore();
  }
};

module.exports.Blank = Blank;
module.exports.Selection = Selection;
module.exports.Rectangle = Rectangle;
module.exports.Circle = Circle;
},{"./bodytype.js":4,"./constants.js":6,"./shapes.js":15}],19:[function(require,module,exports){
// A class for facilitating internationalisation
module.exports = {
  strings: [require('../translations/english.js'), require('../translations/slovak.js')], // Array of languages (each language is an array of strings)
  currentLanguage: 0, // selected language

  getTranslated: function(route, language) {
    if (language == undefined) {
      language = this.currentLanguage;
    }

    var translation = this.strings[language];

    var steps = route.split('.');
    for (var i = 0; i < steps.length; ++i) {
      var step = steps[i];
      if (step in translation) {
        translation = translation[step];
      }
      else {
        throw "ERROR! No translation for " + route;
      }
    }
    return translation;
  },

  getTranslatedWrapped: function(route, language) {
    var ret = el("span", {translation: route});
    ret.innerHTML = this.getTranslated(route, language);

    return ret;
  },

  setLanguage: function(index) {
    this.currentLanguage = index;

    var translated = document.querySelectorAll("[translation]");
    for (var i = 0; i < translated.length; i++) {
      translated[i].innerHTML = this.getTranslated(translated[i].getAttribute("translation"));
    }
  },

  refresh: function () {
    this.setLanguage(this.currentLanguage);
  }
};
},{"../translations/english.js":25,"../translations/slovak.js":26}],20:[function(require,module,exports){
var Type = {
  BOOLEAN: "boolean",
  NUMBER: "number",
  STRING: "string",
  ARRAY: "array",
  ACTION: "action",
  ENTITYFILTER: "entityFilter",
  LITERAL: "literal"
};

var FixType = {
  INFIX: "infix",
  PREFIX: "prefix"
};

module.exports.Type = Type;
module.exports.FixType = FixType;
},{}],21:[function(require,module,exports){
var Tools = require("./tools.js");
var BodyType = require("./bodytype.js");
var UIBuilder = require("./uibuilder.js");
var Constants = require("./constants.js");
var Translations = require("./translations.js");

// Object for building the UI
var UI = {
  // UI initialisation
  initialize: function() {
    var languages = [];
    for (var i = 0; i < Translations.strings.length; i++) {
      languages.push({text: Translations.getTranslated("LANGUAGE_NAME", i), value: i});
    }

    var properties = [
      {
        type: "button",

        id: "play",
        text: Translations.getTranslatedWrapped("START"),
        onclick: function () {
          _engine.togglePause();

          if (_engine.world.paused) {
            $("#play").html(Translations.getTranslatedWrapped("START"));

            $("#collisions, #tool").each(function () {
              this.enable();
            });
          }
          else {
            $("#play").html(Translations.getTranslatedWrapped("PAUSE"));

            $("#collisions, #tool").each(function () {
              this.disable();
            });
          }
        }
      },
      {type: "break"},
      {
        type: "button",

        id: "collisions",
        text: Translations.getTranslatedWrapped("COLLISION_GROUPS"),
        onclick: function () {
          UIBuilder.popup(UI.createCollisions());
        }
      },
      {type: "break"},
      { type: "html", content: Translations.getTranslatedWrapped("TOOL") },
      {
        type: "radio",

        id: "tool",
        elements: [
          {
            text: el.img({src: "./img/selection.svg"}), id: "selectionTool", checked: true, onclick: function () {
            _engine.selectTool(Tools.Selection);
          }
          },
          {
            text: el.img({src: "./img/rectangle.svg"}), onclick: function () {
            _engine.selectTool(Tools.Rectangle);
          }
          },
          {
            text: el.img({src: "./img/circle.svg"}), onclick: function () {
            _engine.selectTool(Tools.Circle);
          }
          },
        ]
      },
      {type: "break"},
      { type: "html", content: Translations.getTranslatedWrapped("ZOOM") },
      {
        type: "range",

        min: 1,
        max: 11,
        step: 0.1,
        value: 6,
        width: "150px",
        disableWrite: true,

        oninput: function(val) {
          _engine.viewport.zoom(val);
        }
      },
      {type: "break"},
      {
        type: "select",
        options: languages,

        onchange: function (value) {
          Translations.setLanguage(value * 1);
        },
      }
    ];

    UIBuilder.buildLayout();
    $(".ui.toolbar")[0].appendChild(UIBuilder.build(properties));
    $(".ui.content")[0].appendChild(el("canvas#mainCanvas"));

  },

  // Building the collision group table
  createCollisions: function() {
    var table = el("table.collisionTable");

    for (var i = 0; i < Constants.COLLISION_GROUPS_NUMBER; i++) {
      var tr = el("tr");

      for (var j = 0; j < Constants.COLLISION_GROUPS_NUMBER; j++) {
        var td = el("td");

        // first row
        if (i === 0 && j > 0) {
          td.innerHTML = "<div><span>" + _engine.collisionGroups[j - 1].name + "</span></div>";
        }

        // first column
        else if (j === 0 && i !== 0)
          td.innerHTML = _engine.collisionGroups[i - 1].name;

        // relevant triangle
        else if (i <= j && j !== 0 && i !== 0) {
          td.row = i;
          td.col = j;

          // highlighting
          td.onmouseover = function(i, j, table) {
            return function() {
              var tds = table.getElementsByTagName("td");
              for (var n = 0; n < tds.length; n++) {
                tds[n].className = "";

                // only highlight up to the relevant cell
                if ((tds[n].row === i && tds[n].col <= j) || (tds[n].col === j && tds[n].row <= i))
                  tds[n].className = "highlight";
              }
            };
          }(i, j, table);

          // more highlighting
          td.onmouseout = function(table) {
            return function() {
              var tds = table.getElementsByTagName("td");
              for (var n = 0; n < tds.length; n++) {
                tds[n].className = "";
              }
            };
          }(table);

          // checkbox for collision toggling
          var checkbox = el("input", {type: "checkbox"});

          if (_engine.getCollision(i - 1, j - 1))
            checkbox.setAttribute("checked", "checked");

          checkbox.onchange = function(i, j, checkbox) {
            return function() {
              _engine.setCollision(i - 1, j - 1, checkbox.checked ? 1 : 0);
            };
          }(i, j, checkbox);

          // clicking the checkbox's cell should work as well
          td.onclick = function(checkbox) {
            return function(e) {
              if (e.target === checkbox)
                return true;

              checkbox.checked = !checkbox.checked;
              checkbox.onchange();
            };
          }(checkbox);

          td.appendChild(checkbox);
        }

        // fix for also highlighting cells without checkboxes
        else {
          td.row = i;
          td.col = j;
        }

        tr.appendChild(td);
      }

      table.appendChild(tr);
    }

    return table;
  },

  createBehavior: function (entity) {
    var BehaviorBuilder = new (require("./behaviorbuilder.js"))(_engine.tokenManager);
    var UIBuilder = require("./uibuilder.js");
    var Type = require("./typing.js").Type;

    var oneBehavior = function(behavior) {
      var wrapper = el("div.behavior");
      var logic = el("div.tokenBuilder", {}, [""]);
      var results = el("div");

      var remover = UIBuilder.button({
        text: Translations.getTranslatedWrapped("BEHAVIORS.REMOVE_BEHAVIOR"), onclick: (function (wrapper) {
          return function () {
            // If the function isn't wrapped, only the last instance of behavior gets passed

            $(wrapper).remove();
          };
        })(wrapper)
      });
      remover.style.float = "right";

      if (behavior === null) {
        BehaviorBuilder.initialize(Type.BOOLEAN, logic);

        results.appendChild(oneResult(null, Translations.getTranslatedWrapped("BEHAVIORS.ACTION"), false));
      }
      else {
        BehaviorBuilder.buildToken(behavior.logic, logic.firstChild);

        results.appendChild(oneResult(behavior.results[0], Translations.getTranslatedWrapped("BEHAVIORS.ACTION"), false));

        for (var j = 1; j < behavior.results.length; j++) {
          results.appendChild(oneResult(behavior.results[j], Translations.getTranslatedWrapped("BEHAVIORS.ANOTHER_ACTION"), true));
        }
      }


      results.appendChild(UIBuilder.button({text: Translations.getTranslatedWrapped("BEHAVIORS.NEW_ACTION"), onclick: function (e) {
        this.parentNode.insertBefore(oneResult(null, Translations.getTranslatedWrapped("BEHAVIORS.ANOTHER_ACTION"), true), this);
      }}));

      wrapper.appendChild(el("h2", {}, [Translations.getTranslatedWrapped("BEHAVIORS.CONDITION"), remover]));
      wrapper.appendChild(logic);
      wrapper.appendChild(results);

      return wrapper;
    };

    var oneResult = function(result, text, enableRemove) {
      var wrapper = el("div");
      var resultElement = el("div.tokenBuilder", {}, [""]);

      var resultRemover = UIBuilder.button({text: Translations.getTranslatedWrapped("BEHAVIORS.REMOVE_BEHAVIOR"), onclick:
        (function(resultElement){return function(){
          // If the function isn't wrapped, only the last instance of result gets passed

          $(resultElement).prev().remove(); // Remove the header
          $(resultElement).remove(); // And the token builder
        };})(resultElement)});
      resultRemover.style.float = "right";

      if(! enableRemove)
        resultRemover = "";

      wrapper.appendChild(el("h2", {}, [
        text,
        resultRemover
      ]));
      wrapper.appendChild(resultElement);

      if(result === null)
        BehaviorBuilder.initialize(Type.ACTION, resultElement);
      else
        BehaviorBuilder.buildToken(result, resultElement.firstChild);

      return wrapper;
    };

    var ret = el("div.behaviorWrapper");

    for (var i = 0; i < entity.behaviors.length; i++) {
      ret.appendChild(oneBehavior(entity.behaviors[i]));
    }

    var that = this;

    var buttons = el("div.bottom", {}, [
      UIBuilder.button({
        text: Translations.getTranslatedWrapped("BEHAVIORS.NEW_BEHAVIOR"),
        onclick: function () {
          ret.appendChild(oneBehavior(null));
          ret.scrollTop = ret.scrollHeight;
        }
      }),
      UIBuilder.break(),
      UIBuilder.button({
        text: Translations.getTranslatedWrapped("BEHAVIORS.CANCEL_BUTTON"),
        onclick: function () {
          UIBuilder.closePopup();
        }
      }),
      UIBuilder.button({
        text: Translations.getTranslatedWrapped("BEHAVIORS.DONE_BUTTON"),
        onclick: function () {
          that.saveBehavior(entity);
          UIBuilder.closePopup();
        }
      }),
    ]);
    var wrapper = el("div", {}, [ret, buttons]);

    return wrapper;
  },

  saveBehavior: function (entity) {
    var Behavior = require("./behavior.js");

    entity.behaviors = [];
    var behaviors = $(".behaviorWrapper .behavior");

    for(var i = 0; i < behaviors.length; i++) {
      var tokenBuilders = $(".tokenBuilder", behaviors[i]);

      try {
        var logic = _engine.tokenManager.parser.parse(tokenBuilders[0].textContent);
        var results = [];

        for(var j = 1; j < tokenBuilders.length; j++) {
          try {
            results.push(_engine.tokenManager.parser.parse(tokenBuilders[j].textContent));
          }
          catch (err) {}
        }

        if (results.length === 0)
          throw "All results blank";

        entity.behaviors.push(new Behavior(logic, results));
      }
      catch (err) {
        // Ignore parsing errors (something left blank)
      }
    }
  },

  buildSidebar: function (entity) {
    var sidebar = $(".sidebar.ui .content");

    sidebar.html("");

    if (entity === null) {
      $(".sidebar.ui .content").html(this.buildEntityList());

      return;
    }

    var properties = [
      // ID
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.ID")},
      { type: "inputText", value: entity.id, oninput: function (val) {_engine.changeId(entity, val);}},
      { type: "html", content: el("p")},

      // Collision group
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.COLLISION_GROUP")},
      { type: "range", value: entity.collisionGroup + 1, min: 1, max: Constants.COLLISION_GROUPS_NUMBER - 1,
        oninput: function (val) {entity.setCollisionGroup(val * 1 - 1);}},
      { type: "html", content: el("p")},

      // Layer
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.LAYER")},
      { type: "range", value: entity.layer + 1, min: 1, max: Constants.LAYERS_NUMBER,
        oninput: function (val) { _engine.setEntityLayer(entity, val*1 - 1); }},
      { type: "html", content: el("p")},

      // X
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.X")},
      { type: "inputNumber", value: entity.body.GetPosition().get_x(), id: "entity_x",
        oninput: function (val) {
          entity.body.SetTransform(new b2Vec2(val * 1, entity.body.GetPosition().get_y()), entity.body.GetAngle());
        }},
      { type: "html", content: el("p")},

      // Y
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.Y")},
      { type: "inputNumber", value: entity.body.GetPosition().get_y(), id: "entity_y",
        oninput: function (val) {
          entity.body.SetTransform(new b2Vec2(entity.body.GetPosition().get_x(), val * 1), entity.body.GetAngle());
        }},
      { type: "html", content: el("p")},

      // WIDTH
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.WIDTH")},
      { type: "inputNumber", value: entity.getWidth(), step: 0.1, id: "entity_width",
        oninput: function (val) {
          if(entity.nameString === "CIRCLE") {
            entity.resize(val / 2);
            $("#entity_height").val(val);

            return;
          }

          entity.resize(val / 2, entity.getHeight() / 2);
        }},
      { type: "html", content: el("p")},

      // HEIGHT
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.HEIGHT")},
      { type: "inputNumber", value: entity.getHeight(), step: 0.1, id: "entity_height",
        oninput: function (val) {
          if(entity.nameString === "CIRCLE") {
            entity.resize(val / 2);
            $("#entity_width").val(val);

            return;
          }

          entity.resize(entity.getWidth() / 2, val / 2);
        }},
      { type: "html", content: el("p")},

      // Rotation
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.ROTATION")},
      { type: "range", min: 0, max: 360, step: 1, value: (((entity.body.GetAngle() * 180 / Math.PI) % 360)+360)%360, id: "entity_rotation",
        oninput: function (val) {entity.body.SetTransform(entity.body.GetPosition(), ((val * 1) * Math.PI / 180)%360);}},
      { type: "html", content: el("p")},

      // Fixed rotation
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.FIXED_ROTATION")},
      { type: "checkbox", checked: entity.fixedRotation, onchange: function(val) { entity.disableRotation(val); } },
      { type: "html", content: el("p")},

      // Restitution
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.RESTITUTION")},
      { type: "range", min: 0, max: 1, step: 0.1, value: entity.fixture.GetRestitution(),
        oninput: function (val) {entity.fixture.SetRestitution(val*1);}},
      { type: "html", content: el("p")},

      // Friction
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.FRICTION")},
      { type: "range", min: 0, max: 1, step: 0.1, value: entity.fixture.GetFriction(),
        oninput: function (val) {entity.fixture.SetFriction(val*1);entity.body.ResetMassData();}},
      { type: "html", content: el("p")},

      // Density
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.DENSITY")},
      { type: "inputNumber", value: entity.fixture.GetDensity(), min: 0,
        oninput: function (val) {entity.fixture.SetDensity(val*1);entity.body.ResetMassData();}},
      { type: "html", content: el("p")},

      // Color
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.COLOR")},
      { type: "inputColor", value: entity.color, oninput: function (val) {entity.color = val}},
      { type: "html", content: el("p")},

      // Body type
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPE")},
      {
        type: "select", selected: entity.body.GetType(), onchange: function (val) {entity.body.SetType(val * 1)},
        options: [
          { text: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPES.DYNAMIC"), value: BodyType.DYNAMIC_BODY },
          { text: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPES.KINEMATIC"), value: BodyType.KINEMATIC_BODY },
          { text: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPES.STATIC"), value: BodyType.STATIC_BODY },
        ]
      },
      { type: "html", content: el("p")},

      { type: "button", text: Translations.getTranslatedWrapped("SIDEBAR.DELETE_BUTTON"), onclick: function () {
        if(confirm(Translations.getTranslated("SIDEBAR.DELETE_CONFIRM")))
          _engine.removeEntity(entity);
      }},
      { type: "html", content: el("p")},

      { type: "button", text: Translations.getTranslatedWrapped("SIDEBAR.SET_BEHAVIORS"), onclick: function () {
        UIBuilder.popup(UI.createBehavior(entity));
      }},
      { type: "html", content: el("p")},

    ];

    sidebar[0].appendChild(UIBuilder.build(properties));
  },

  buildEntityList: function () {
    var ret = el("div.entityList");

    for (var i = 0; i < Constants.LAYERS_NUMBER; i++)
    {
      if (_engine.layers[i].length === 0)
        continue;

      var layerElement = el("div.layer", {}, [Translations.getTranslatedWrapped("LAYER"), " " + (i + 1) + ":"]);

      for (var j = 0; j < _engine.layers[i].length; j++) {
        var entity = _engine.layers[i][j];

        var entityElement = el("div.entity", {}, [el("span", {}, [
          el("span.id", {}, [entity.id]), ": ", Translations.getTranslatedWrapped(entity.nameString)
        ])]);

        entityElement.onclick = (function (entity) {
          return function () {
            _engine.selectEntity(entity);
          };
        })(entity);

        layerElement.appendChild(entityElement);
      }

      ret.appendChild(layerElement);
    }

    return ret;
  }
};

module.exports = UI;
},{"./behavior.js":2,"./behaviorbuilder.js":3,"./bodytype.js":4,"./constants.js":6,"./tools.js":18,"./translations.js":19,"./typing.js":20,"./uibuilder.js":22}],22:[function(require,module,exports){
var Translations = require("./translations.js");

var UIBuilder = {
  radio: function (properties) {
    properties = $.extend({}, {
      id: "radioGroup-" + $(".radioGroup").length,
    }, properties);

    var ret = el("div.ui.radioGroup", {id: properties.id});

    ret.disable = function () {
      $("input[type=radio]", this).each(function(){
        this.disable();
      });
    };

    ret.enable = function () {
      $("input[type=radio]", this).each(function(){
        this.enable();
      });
    };
    
    var idCount = $("input[type=radio]").length;

    properties.elements.forEach(function(element) {
      element = $.extend({}, {
        id: "radio-" + idCount++,
        checked: false,
        onclick: function(){}
      }, element);

      var input = el("input.ui", {type: "radio", id: element.id, name: properties.id});
      var label = el("label.ui.button", {for: element.id}, [element.text]);

      input.enable = function() {
        this.disabled = false;
        $("+label", this).removeClass("disabled");
      };

      input.disable = function() {
        this.disabled = true;
        $("+label", this).addClass("disabled");
      };

      label.onclick = function () {
        if($(this).hasClass("disabled"))
          return;

        element.onclick();
      };

      input.checked = element.checked;

      ret.appendChild(input);
      ret.appendChild(label);
    });

    return ret;
  },
  
  button: function (properties) {
    properties = $.extend({}, {
      id: "button-" + $(".button").length,
      onclick: function(){}
    }, properties);

    var ret = el("span.ui.button", { id: properties.id }, [properties.text]);

    ret.disable = function ()
    {
      $(this).addClass("disabled");
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
    };

    ret.onclick = function (e) {
      if($(this).hasClass("disabled"))
        return;

      properties.onclick.call(this, e);
    };

    return ret;
  },

  select: function (properties) {
    properties = $.extend({}, {
      id: "select-" + $("select").length,
      selected: "",
      onchange: function(){}
    }, properties);

    var ret = el("select.ui", { id: properties.id });

    ret.onchange = function () {
      properties.onchange(this.value);
    };

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = enable;
    };

    properties.options.forEach(function (option, index) {
      ret.appendChild(el("option", {value: option.value}, [option.text]));

      if (option.value == properties.selected)
        ret.selectedIndex = index;
    });

    return ret;
  },

  break: function () {
    return el("span.ui.break");
  },

  inputText: function (properties) {
    properties = $.extend({}, {
      id: "inputText-" + $("input[type=text]").length,
      value: "",
      oninput: function(){}
    }, properties);

    var ret = el("input.ui", { type: "text", id: properties.id, value: properties.value });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    ret.oninput = function () {
      properties.oninput(this.value);
    };

    return ret;
  },

  inputNumber: function (properties) {
    properties = $.extend({}, {
      id: "inputNumber-" + $("input[type=number]").length,
      value: 0,
      min: -Infinity,
      max: Infinity,
      step: 1,
      oninput: function(){}
    }, properties);

    var ret = el("input.ui", { type: "number", id: properties.id, value: properties.value, min: properties.min, max: properties.max, step: properties.step });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    ret.oninput = function (e) {
      properties.oninput(this.value);
    };

    return ret;
  },

  html: function (properties) {
    properties = $.extend({}, {
      content: ""
    }, properties);

    return properties.content;
  },

  inputColor: function (properties) {
    properties = $.extend({}, {
      id: "inputColor-" + $("input[type=color]").length,
      value: "#000000",
      oninput: function(){}
    }, properties);

    var ret = el("input.ui.button", { type: "color", id: properties.id, value: properties.value });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    ret.oninput = function () {
      properties.oninput(this.value);
    };

    return ret;
  },

  range: function (properties) {
    properties = $.extend({}, {
      id: "range-" + $("input[type=range]").length,
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      width: "100%",
      disableWrite: false,
      oninput: function(){},
    }, properties);

    var slider = el("input.ui", { type: "range", min: properties.min, max: properties.max, step: properties.step, value: properties.value, id: properties.id });
    var input = this.inputNumber(properties);

    input.oninput = function() {
      properties.oninput(input.value);
      slider.value = input.value;
    };

    slider.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;

      $(input).addClass("disabled");
      input.disabled = true;
    };

    slider.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;

      $(input).removeClass("disabled");
      input.disabled = false;
    };

    slider.oninput = function () {
      properties.oninput(this.value);
      input.value = this.value;
    };

    var ret = [slider, input];
    if (properties.disableWrite)
      ret = [slider];

    return el("div.ui.range", {style: "width:"+properties.width}, ret);
  },

  checkbox: function (properties) {
    properties = $.extend({}, {
      id: "checkbox-" + $("input[type=checkbox]").length,
      checked: false,
      onchange: function(){}
    }, properties);

    var ret = el("span");
    var checkbox = el("input.ui", { type: "checkbox", id: properties.id });
    var label = el("label.ui.button", { for: properties.id });

    ret.appendChild(checkbox);
    ret.appendChild(label);

    checkbox.disable = function () {
      $("+label", this).addClass("disabled");
      this.disabled = true;
    };

    checkbox.enable = function () {
      $("+label", this).removeClass("disabled");
      this.disabled = false;
    };

    checkbox.checked = properties.checked;

    checkbox.onchange = function () {
      properties.onchange(this.checked);
    };

    return ret;
  },

  build: function (properties) {
    var ret = el.div();

    properties.forEach(function (element) {
      var generated;
      
      switch (element.type) {
        case "radio":
          generated = this.radio(element);
          break;

        case "button":
          generated = this.button(element);
          break;

        case "select":
          generated = this.select(element);
          break;

        case "inputText":
          generated = this.inputText(element);
          break;

        case "inputNumber":
          generated = this.inputNumber(element);
          break;

        case "inputColor":
          generated = this.inputColor(element);
          break;

        case "checkbox":
          generated = this.checkbox(element);
          break;

        case "range":
          generated = this.range(element);
          break;

        case "html":
          generated = this.html(element);
          break;

        case "break":
          generated = this.break();
          break;
      }
      
      ret.appendChild(generated);
    }, this);
    
    return ret;
  },
  
  buildLayout: function() {
    var content = el("div.ui.content.panel");
    var sidebar = el("div.ui.sidebar.panel", {}, [ el("div.content") ]);
    var resizer = el("div.ui.resizer");
    var toolbar = el("div.ui.toolbar");

    var w = $("body").outerWidth();
    var sidebarWidth = 250;

    content.style.width = w - 250 + "px";
    sidebar.style.width = sidebarWidth + "px";

    var sidebarResizeEvent = function (e) {
      e.preventDefault();

      var windowWidth = $("body").outerWidth();
      var sidebarWidth = Math.max(30, Math.min(windowWidth * 0.6, windowWidth - e.clientX));
      var contentWidth = windowWidth - sidebarWidth;

      sidebar.style.width = sidebarWidth + "px";
      content.style.width = contentWidth + "px";

      window.onresize();
    };

    var mouseUpEvent = function (e) {
      sidebar.resizing = false;

      $(".resizer.ui").removeClass("resizing");

      window.removeEventListener("mousemove", sidebarResizeEvent);
      window.removeEventListener("mouseup", mouseUpEvent);
    };

    var windowResizeEvent = function () {
      var windowWidth = $("body").outerWidth();
      var contentWidth = Math.max(windowWidth * 0.4, Math.min(
        windowWidth - 30,
        windowWidth - $(".sidebar.ui").outerWidth()
      ));
      var sidebarWidth = windowWidth - contentWidth;

      sidebar.style.width = sidebarWidth + "px";
      content.style.width = contentWidth + "px";
    };

    resizer.onmousedown = function (e) {
      sidebar.resizing = true;

      $(this).addClass("resizing");

      window.addEventListener("mousemove", sidebarResizeEvent);
      window.addEventListener("mouseup", mouseUpEvent);
    };

    window.addEventListener("resize", windowResizeEvent);

    content.appendChild(toolbar);
    sidebar.appendChild(resizer);
    document.body.appendChild(content);
    document.body.appendChild(sidebar);
  },

  // Creating a popup message
  popup: function(data) {
    var overlay = el("div#popupOverlay", [el("div#popupContent", [data])]);
    overlay.onclick = function(e) {
      UIBuilder.closePopup(e);
    };

    document.body.insertBefore(overlay, document.body.firstChild);

    Translations.refresh();
  },

  // Closing a popup message
  closePopup: function(e) {
    var overlay = document.getElementById("popupOverlay");
    var content = document.getElementById("popupContent");

    // Make sure it was the overlay that was clicked, not an element above it
    if (typeof e !== "undefined" && e.target !== overlay)
      return true;

    content.parentNode.removeChild(content);
    overlay.parentNode.removeChild(overlay);
  },



};

module.exports = UIBuilder;
},{"./translations.js":19}],23:[function(require,module,exports){
// Object containing useful methods
var Utils = {
  getBrowserWidth: function() {
    return $(".ui.content").outerWidth();
  },

  getBrowserHeight: function() {
    return $(".ui.content").outerHeight() - $(".ui.toolbar").outerHeight();
  },

  randomRange: function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },

};

Array.prototype.equalTo = function (b) {
  if (this.length != b.length)
    return false;

  for (var i = 0; i < b.length; i++) {
    if (this[i].equalTo) {
      if (!this[i].equalTo(b[i]))
        return false;
    }

    else if (this[i] !== b[i])
      return false;
  }

  return true;
};

Array.prototype.equalIndexOf = function (needle) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === needle)
      return i;

    if (Array.isArray(needle) && Array.isArray(this[i]) && this[i].equalTo(needle))
      return i;
  }

  return -1;
};

module.exports = Utils;
},{}],24:[function(require,module,exports){
var Utils = require("./utils.js");
var Constants = require("./constants.js");

// VIEWPORT
// This is basically camera + projector

var Viewport = function (canvasElement, width, height, x, y) {
  this.scale = Constants.DEFAULT_SCALE;

  // Canvas dimensions
  if (width != undefined && height != undefined) {
    this.setAutoResize(false);
    this.width = width;
    this.height = height;
  } else {
    this.setAutoResize(true);
    this.autoResize();
  }

  // Center point of the camera
  if (x !== undefined && y !== undefined) {
    this.x = x;
    this.y = y;
  } else {
    this.x = 0;
    this.y = 0;
  }

  // Canvas element
  this.canvasElement = canvasElement;

  if (canvasElement === undefined) {
    this.canvasElement = document.createElement("canvas");
    document.body.appendChild(this.canvasElement);
  }

  this.resetElement(); // Resize to new dimensions

  this.context = this.canvasElement.getContext("2d");
};

// Reloads values for the canvas element
Viewport.prototype.resetElement = function () {
  this.canvasElement.width = this.width;
  this.canvasElement.height = this.height;
};

// Automatically resizes the viewport to fill the screen
Viewport.prototype.autoResize = function () {
  this.width = Utils.getBrowserWidth();
  this.height = Utils.getBrowserHeight();
};

// Toggles viewport auto resizing
Viewport.prototype.setAutoResize = function (value) {

  this.autoResizeActive = value;

  if (this.autoResizeActive) {
    var t = this;
    window.onresize = function () {
      t.autoResize();
      t.resetElement();
    };
  } else {
    window.onresize = null;
  }
};

Viewport.prototype.zoom = function (val) {
  var a = 1.5;
  this.scale = (Constants.DEFAULT_SCALE / Math.pow(a, 6)) * Math.pow(a, 12 - val);

  if(_engine.selectedEntity)
    _engine.selectedEntity.recalculateHelpers();
};

Viewport.prototype.getOffset = function () {
  return [this.x - this.width / 2, this.y - this.height / 2];
};

Viewport.prototype.toScale = function (number) {
  return number * this.scale;
};

Viewport.prototype.fromScale = function (number) {
  return number / this.scale;
};

module.exports = Viewport;
},{"./constants.js":6,"./utils.js":23}],25:[function(require,module,exports){
module.exports = {
  LANGUAGE_NAME: "English",
  COLLISION_GROUPS: "Collision groups",
  START: "Start",
  PAUSE: "Pause",
  LAYER: "Layer ",
  ZOOM: "Zoom: ",

  TOOL: "Tool: ",
  RECTANGLE: "Rectangle",
  CIRCLE: "Circle",

  BEHAVIORS: {
    CONDITION: "When the following conditon is met:",
    INPUT_DIALOG: "Insert a correct value for ",
    ACTION: "Do this:",
    ANOTHER_ACTION: "And this:",
    NEW_ACTION: "Add new action",
    NEW_BEHAVIOR: "Add new behavior",
    REMOVE_ACTION: "Remove action",
    REMOVE_BEHAVIOR: "Remove behavior",
    DONE_BUTTON: "Done",
    CANCEL_BUTTON: "Cancel",
  },

  SIDEBAR: {
    ID: "ID:",
    COLLISION_GROUP: "Collision group:",
    X: "X-axis position:",
    Y: "Y-axis position:",
    WIDTH: "Width:",
    HEIGHT: "Height:",
    ROTATION: "Rotation:",
    FIXED_ROTATION: "Fixed rotation:",
    RESTITUTION: "Restitution:",
    FRICTION: "Friction:",
    DENSITY: "Density:",
    COLOR: "Color:",
    LAYER: "Layer:",
    DELETE_BUTTON: "Delete object",
    DELETE_CONFIRM: "Are you sure you want to delete this object?",
    SET_BEHAVIORS: "Set behavior",

    BODY_TYPE: "Body type:",
    BODY_TYPES: {
      DYNAMIC: "Dynamic",
      STATIC: "Static",
      KINEMATIC: "Kinematic",
    },
  }
};
},{}],26:[function(require,module,exports){
module.exports = {
  LANGUAGE_NAME: "Slovensky",
  COLLISION_GROUPS: "Skupiny pre kolízie",
  START: "Štart",
  PAUSE: "Pauza",
  LAYER: "Vrstva ",
  ZOOM: "Priblíženie: ",

  TOOL: "Nástroj: ",
  RECTANGLE: "Obdĺžnik",
  CIRCLE: "Kruh",

  BEHAVIORS: {
    CONDITION: "Keď platí nasledujúca podmienka:",
    INPUT_DIALOG: "Zadajte korektnú hodnotu pre ",
    ACTION: "Sprav toto:",
    ANOTHER_ACTION: "A toto:",
    NEW_ACTION: "Pridať novú akciu",
    NEW_BEHAVIOR: "Pridať novú podmienku",
    REMOVE_ACTION: "Odstrániť akciu",
    REMOVE_BEHAVIOR: "Odstrániť podmienku",
    DONE_BUTTON: "Hotovo",
    CANCEL_BUTTON: "Zrušiť",
  },

  SIDEBAR: {
    ID: "ID:",
    COLLISION_GROUP: "Skupina pre kolízie:",
    X: "Pozícia na osi X:",
    Y: "Pozícia na osi Y:",
    WIDTH: "Šírka:",
    HEIGHT: "Výška:",
    ROTATION: "Rotácia:",
    FIXED_ROTATION: "Fixná rotácia:",
    RESTITUTION: "Pružnosť:",
    FRICTION: "Trenie:",
    DENSITY: "Hustota:",
    COLOR: "Farba:",
    LAYER: "Vrstva:",
    DELETE_BUTTON: "Odstrániť objekt",
    DELETE_CONFIRM: "Naozaj chcete odstrániť tento objekt?",
    SET_BEHAVIORS: "Nastaviť správanie",

    BODY_TYPE: "Druh telesa:",
    BODY_TYPES: {
      DYNAMIC: "Dynamické",
      STATIC: "Statické",
      KINEMATIC: "Kinematické",
    },
  }
};
},{}]},{},[10])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvYWN0aW9ucy5qcyIsImFwcC9qcy9iZWhhdmlvci5qcyIsImFwcC9qcy9iZWhhdmlvcmJ1aWxkZXIuanMiLCJhcHAvanMvYm9keXR5cGUuanMiLCJhcHAvanMvY2xpY2thYmxlaGVscGVyLmpzIiwiYXBwL2pzL2NvbnN0YW50cy5qcyIsImFwcC9qcy9lbmdpbmUuanMiLCJhcHAvanMvZW50aXR5LmpzIiwiYXBwL2pzL2VudGl0eWZpbHRlcnMuanMiLCJhcHAvanMvZW50cnkuanMiLCJhcHAvanMvZ2VvbWV0cnkuanMiLCJhcHAvanMvaW5wdXQuanMiLCJhcHAvanMvbG9naWMuanMiLCJhcHAvanMvcGFyc2VyLmpzIiwiYXBwL2pzL3NoYXBlcy5qcyIsImFwcC9qcy90b2tlbi5qcyIsImFwcC9qcy90b2tlbm1hbmFnZXIuanMiLCJhcHAvanMvdG9vbHMuanMiLCJhcHAvanMvdHJhbnNsYXRpb25zLmpzIiwiYXBwL2pzL3R5cGluZy5qcyIsImFwcC9qcy91aS5qcyIsImFwcC9qcy91aWJ1aWxkZXIuanMiLCJhcHAvanMvdXRpbHMuanMiLCJhcHAvanMvdmlld3BvcnQuanMiLCJhcHAvdHJhbnNsYXRpb25zL2VuZ2xpc2guanMiLCJhcHAvdHJhbnNsYXRpb25zL3Nsb3Zhay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQWN0aW9uID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuQWN0aW9uO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBbXTtcclxuXHJcbnZhciBhU2V0Q29sb3IgPSBmdW5jdGlvbihlZiwgY29sb3IpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcInNldENvbG9yXCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLlNUUklOR10pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goY29sb3IpO1xyXG59O1xyXG5hU2V0Q29sb3IucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYVNldENvbG9yLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LnNldENvbG9yKHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcclxufTtcclxuXHJcbmFTZXRDb2xvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhU2V0Q29sb3I7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goYVNldENvbG9yKTtcclxuXHJcblxyXG52YXIgYVRvcnF1ZSA9IGZ1bmN0aW9uKGVmLCBzdHJlbmd0aCkge1xyXG4gIEFjdGlvbi5jYWxsKHRoaXMsIFwiYXBwbHlUb3JxdWVcIiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaChzdHJlbmd0aCk7XHJcbn07XHJcbmFUb3JxdWUucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYVRvcnF1ZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5ib2R5LlNldEF3YWtlKDEpO1xyXG4gIGVudGl0eS5ib2R5LkFwcGx5VG9ycXVlKGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XHJcbn07XHJcblxyXG5hVG9ycXVlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFUb3JxdWU7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goYVRvcnF1ZSk7XHJcblxyXG5cclxudmFyIGFBbmd1bGFySW1wdWxzZSA9IGZ1bmN0aW9uKGVmLCBzdHJlbmd0aCkge1xyXG4gIEFjdGlvbi5jYWxsKHRoaXMsIFwiYXBwbHlBbmd1bGFySW1wdWxzZVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHN0cmVuZ3RoKTtcclxufTtcclxuYUFuZ3VsYXJJbXB1bHNlLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuXHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5ib2R5LlNldEF3YWtlKDEpO1xyXG4gIGVudGl0eS5ib2R5LkFwcGx5QW5ndWxhckltcHVsc2UoZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcclxufTtcclxuXHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhQW5ndWxhckltcHVsc2U7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goYUFuZ3VsYXJJbXB1bHNlKTtcclxuXHJcblxyXG52YXIgYUxpbmVhclZlbG9jaXR5ID0gZnVuY3Rpb24oZWYsIHgsIHkpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcInNldExpbmVhclZlbG9jaXR5XCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHgpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHkpO1xyXG59O1xyXG5hTGluZWFyVmVsb2NpdHkucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYUxpbmVhclZlbG9jaXR5LnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LmJvZHkuU2V0QXdha2UoMSk7XHJcbiAgZW50aXR5LnNldExpbmVhclZlbG9jaXR5KG5ldyBiMlZlYzIodGhpcy5hcmdzWzFdLmV2YWx1YXRlKCksIHRoaXMuYXJnc1syXS5ldmFsdWF0ZSgpKSk7XHJcbn07XHJcblxyXG5hTGluZWFyVmVsb2NpdHkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYUxpbmVhclZlbG9jaXR5O1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFMaW5lYXJWZWxvY2l0eSk7XHJcblxyXG5cclxudmFyIGFMaW5lYXJJbXB1bHNlID0gZnVuY3Rpb24oZWYsIHgsIHkpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5TGluZWFySW1wdWxzZVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaCh4KTtcclxuICB0aGlzLmFyZ3MucHVzaCh5KTtcclxufTtcclxuYUxpbmVhckltcHVsc2UucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYUxpbmVhckltcHVsc2UucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuYm9keS5TZXRBd2FrZSgxKTtcclxuICBlbnRpdHkuYXBwbHlMaW5lYXJJbXB1bHNlKG5ldyBiMlZlYzIoZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpLCBlbnRpdHkuZ2V0TWFzcygpICogdGhpcy5hcmdzWzJdLmV2YWx1YXRlKCkpKTtcclxufTtcclxuXHJcbmFMaW5lYXJJbXB1bHNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFMaW5lYXJJbXB1bHNlO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFMaW5lYXJJbXB1bHNlKTtcclxuXHJcbiIsInZhciBCZWhhdmlvciA9IGZ1bmN0aW9uKGxvZ2ljLCByZXN1bHRzKSB7XG4gIHRoaXMubG9naWMgPSBsb2dpYztcbiAgdGhpcy5yZXN1bHRzID0gQXJyYXkuaXNBcnJheShyZXN1bHRzKSA/IHJlc3VsdHMgOiBbcmVzdWx0c107XG59O1xuXG5CZWhhdmlvci5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgcmV0dXJuIHRoaXMubG9naWMuZXZhbHVhdGUoZW50aXR5KTtcbn07XG5cbkJlaGF2aW9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXCJCZWhhdmlvcihcIiArIHRoaXMubG9naWMudG9TdHJpbmcoKSArIFwiLCBcIiArIHRoaXMucmVzdWx0cy50b1N0cmluZygpICsgXCIpXCI7XG59O1xuXG5CZWhhdmlvci5wcm90b3R5cGUucmVzdWx0ID0gZnVuY3Rpb24oKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGhpcy5yZXN1bHRzW2ldLmV4ZWN1dGUoKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCZWhhdmlvcjsiLCJ2YXIgRml4VHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5GaXhUeXBlO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxudmFyIEJlaGF2aW9yQnVpbGRlciA9IGZ1bmN0aW9uICh0b2tlbk1hbmFnZXIpIHtcclxuICB0aGlzLnRva2VuTWFuYWdlciA9IHRva2VuTWFuYWdlcjtcclxufTtcclxuXHJcbkJlaGF2aW9yQnVpbGRlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uICh0eXBlLCBjb250YWluZXIpIHtcclxuICB2YXIgYnRuID0gZWwoXCJzcGFuLnVpLmJ1dHRvblwiLCB7fSwgW1wiK1wiXSk7XHJcbiAgYnRuLnR5cGUgPSB0eXBlO1xyXG5cclxuICBidG4ub25jbGljayA9IHRoaXMuYnVpbGRDaG9pY2VDbGljaygpO1xyXG5cclxuICAkKGNvbnRhaW5lcikuaHRtbChidG4pO1xyXG59O1xyXG5cclxuQmVoYXZpb3JCdWlsZGVyLnByb3RvdHlwZS5idWlsZENob2ljZUNsaWNrID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIHRoYXQuYnVpbGRDaG9pY2UodGhhdC50b2tlbk1hbmFnZXIuZ2V0VG9rZW5zQnlUeXBlKHRoaXMudHlwZSksIHRoaXMpO1xyXG4gIH07XHJcbn07XHJcblxyXG5CZWhhdmlvckJ1aWxkZXIucHJvdG90eXBlLmJ1aWxkQXJndW1lbnQgPSBmdW5jdGlvbiAodG9rZW4sIGFyZ0luZGV4LCBhcmdIb2xkZXIpIHtcclxuICAvLyBCdWlsZHMgYW4gYXJndW1lbnQgb3IgYXJndW1lbnQgcGxhY2Vob2xkZXIuIFJldHVybnMgZmFsc2Ugb24gYmFkIGxpdGVyYWwgaW5wdXQuXHJcblxyXG4gIGlmICh0b2tlbi5hcmdzW2FyZ0luZGV4XSAhPSB1bmRlZmluZWQpIHtcclxuICAgIC8vIFRva2VuIGluIGFyZ3VtZW50IGV4aXN0cywgYnVpbGQgaXRcclxuICAgIFxyXG4gICAgaWYgKHRva2VuLmFyZ3VtZW50X3R5cGVzW2FyZ0luZGV4XSA9PT0gVHlwZS5MSVRFUkFMKSB7XHJcbiAgICAgIC8vIExpdGVyYWxzIGFyZSBkZWFsdCB3aXRoIGFuZCBkb25lXHJcblxyXG4gICAgICAkKGFyZ0hvbGRlcikucmVwbGFjZVdpdGgoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodG9rZW4uYXJnc1thcmdJbmRleF0pKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5idWlsZFRva2VuKHRva2VuLmFyZ3NbYXJnSW5kZXhdLCBhcmdIb2xkZXIpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgLy8gQXJndW1lbnQgaXMgZW1wdHkgc28gZmFyLCBhZGQgYSBidXR0b24gdG8gY3JlYXRlIG5ld1xyXG5cclxuICAgIGlmICh0b2tlbi5hcmd1bWVudF90eXBlc1thcmdJbmRleF0gPT09IFR5cGUuTElURVJBTCkge1xyXG4gICAgICAvLyBMaXRlcmFscyBhcmUgZGVhbHQgd2l0aCBhbmQgZG9uZVxyXG5cclxuICAgICAgdG9rZW4ucG9wdWxhdGUoKTtcclxuICAgICAgaWYgKCEgdG9rZW4udmFsaWRhdGUoKSlcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAkKGFyZ0hvbGRlcikucmVwbGFjZVdpdGgoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodG9rZW4uYXJnc1thcmdJbmRleF0pKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplKHRva2VuLmFyZ3VtZW50X3R5cGVzW2FyZ0luZGV4XSwgYXJnSG9sZGVyKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbkJlaGF2aW9yQnVpbGRlci5wcm90b3R5cGUuYnVpbGRUb2tlbiA9IGZ1bmN0aW9uICh0b2tlbiwgaG9sZGVyKSB7XHJcbiAgdmFyIHJldCA9IGVsKFwic3Bhbi50b2tlblwiLCB7fSwgW2VsKFwic3Bhbi5uYW1lXCIsIHt9LCBbdG9rZW4ubmFtZV0pXSk7XHJcblxyXG4gIHJldC50eXBlID0gdG9rZW4udHlwZTtcclxuICByZXQub25jbGljayA9IHRoaXMuYnVpbGRDaG9pY2VDbGljaygpO1xyXG5cclxuICB2YXIgYXJnSG9sZGVyO1xyXG5cclxuICAvLyBGaXgsIHNvIDpob3ZlciB0cmlnZ2VycyBvbmx5IG9uIGFjdHVhbCBob3ZlcmVkIHRva2VuLCBub3QgaXRzIGFuY2VzdG9yc1xyXG4gIHJldC5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICQodGhpcykuYWRkQ2xhc3MoXCJob3ZlclwiKTtcclxuICB9O1xyXG4gIHJldC5vbm1vdXNlb3V0ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJob3ZlclwiKTtcclxuICB9O1xyXG5cclxuICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5QUkVGSVgpIHtcclxuICAgIHJldC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIiggXCIpKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHRva2VuLmFyZ3VtZW50X3R5cGVzLmxlbmd0aDsgaW5kZXggKyspIHtcclxuICAgICAgYXJnSG9sZGVyID0gZWwoXCJzcGFuLmFyZ3VtZW50XCIpO1xyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQoYXJnSG9sZGVyKTtcclxuXHJcbiAgICAgIGlmICghIHRoYXQuYnVpbGRBcmd1bWVudCh0b2tlbiwgaW5kZXgsIGFyZ0hvbGRlcikpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpbmRleCAhPT0gdG9rZW4uYXJndW1lbnRfdHlwZXMubGVuZ3RoIC0gMSlcclxuICAgICAgICByZXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIsIFwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIClcIikpO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRva2VuLmZpeFR5cGUgPT09IEZpeFR5cGUuSU5GSVgpIHtcclxuICAgIHJldC5pbnNlcnRCZWZvcmUoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIgKSBcIiksIHJldC5maXJzdENoaWxkKTtcclxuICAgIHJldC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIiAoIFwiKSk7XHJcblxyXG4gICAgYXJnSG9sZGVyID0gZWwoXCJzcGFuXCIpO1xyXG4gICAgcmV0Lmluc2VydEJlZm9yZShhcmdIb2xkZXIsIHJldC5maXJzdENoaWxkKTtcclxuICAgIHJldC5pbnNlcnRCZWZvcmUoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIgKCBcIiksIHJldC5maXJzdENoaWxkKTtcclxuXHJcbiAgICB0aGlzLmJ1aWxkQXJndW1lbnQodG9rZW4sIDAsIGFyZ0hvbGRlcik7XHJcblxyXG4gICAgYXJnSG9sZGVyID0gZWwoXCJzcGFuXCIpO1xyXG4gICAgcmV0LmFwcGVuZENoaWxkKGFyZ0hvbGRlcik7XHJcbiAgICByZXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIgKSBcIikpO1xyXG5cclxuICAgIHRoaXMuYnVpbGRBcmd1bWVudCh0b2tlbiwgMSwgYXJnSG9sZGVyKTtcclxuICB9XHJcblxyXG4gICQoaG9sZGVyKS5yZXBsYWNlV2l0aChyZXQpO1xyXG59O1xyXG5cclxuQmVoYXZpb3JCdWlsZGVyLnByb3RvdHlwZS5idWlsZENob2ljZSA9IGZ1bmN0aW9uICh0b2tlbnMsIGhvbGRlcikge1xyXG4gICQoXCJkaXYjdG9rZW5DaG9pY2VcIikucmVtb3ZlKCk7XHJcbiAgdmFyIGNvbnRhaW5lciA9IGVsKFwiZGl2I3Rva2VuQ2hvaWNlXCIpO1xyXG4gIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgdG9rZW5zLmZvckVhY2goZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICB2YXIgdGV4dCA9IGVsKFwiZGl2LnRva2VuXCIsIHt9LCBbZWwoXCJzcGFuLm5hbWVcIiwge30sIFt0b2tlbi5uYW1lXSldKTtcclxuXHJcbiAgICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5QUkVGSVgpXHJcbiAgICAgIHRleHQuYXBwZW5kQ2hpbGQoZWwoXCJzcGFuLmFyZ3VtZW50XCIsIHt9LCBbXCIoIFwiLCB0b2tlbi5hcmd1bWVudF90eXBlcy5qb2luKFwiLCBcIiksIFwiIClcIl0pKTtcclxuXHJcbiAgICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5JTkZJWCkge1xyXG4gICAgICB0ZXh0Lmluc2VydEJlZm9yZShlbChcInNwYW4uYXJndW1lbnRcIiwge30sIFtcIiggXCIsIHRva2VuLmFyZ3VtZW50X3R5cGVzWzBdLCBcIiApXCJdKSwgdGV4dC5maXJzdENoaWxkKTtcclxuICAgICAgdGV4dC5hcHBlbmRDaGlsZChlbChcInNwYW4uYXJndW1lbnRcIiwge30sIFtcIiggXCIsIHRva2VuLmFyZ3VtZW50X3R5cGVzWzFdLCBcIiApXCJdKSk7XHJcbiAgICB9XHJcblxyXG4gICAgJCh0ZXh0KS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHRoYXQuYnVpbGRUb2tlbihuZXcgdG9rZW4uY29uc3RydWN0b3IoKSwgaG9sZGVyKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0KTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xyXG5cclxuICAkKGRvY3VtZW50KS5vbmUoXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAkKFwiZGl2I3Rva2VuQ2hvaWNlXCIpLnJlbW92ZSgpO1xyXG4gIH0pO1xyXG5cclxuICB2YXIgb2Zmc2V0ID0gMTU7XHJcblxyXG4gICQoY29udGFpbmVyKS5jc3MoXCJsZWZ0XCIsIF9lbmdpbmUuaW5wdXQubW91c2UucmVhbFggKyBvZmZzZXQgKyBcInB4XCIpO1xyXG4gICQoY29udGFpbmVyKS5jc3MoXCJ0b3BcIiwgX2VuZ2luZS5pbnB1dC5tb3VzZS5yZWFsWSArIG9mZnNldCArIFwicHhcIik7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJlaGF2aW9yQnVpbGRlcjtcclxuIiwidmFyIEJvZHlUeXBlID0ge1xyXG4gIERZTkFNSUNfQk9EWTogTW9kdWxlLmIyX2R5bmFtaWNCb2R5LFxyXG4gIFNUQVRJQ19CT0RZOiBNb2R1bGUuYjJfc3RhdGljQm9keSxcclxuICBLSU5FTUFUSUNfQk9EWTogTW9kdWxlLmIyX2tpbmVtYXRpY0JvZHlcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQm9keVR5cGU7IiwidmFyIENvbnN0YW50cyA9IHJlcXVpcmUoXCIuL2NvbnN0YW50cy5qc1wiKTtcclxuXHJcblxyXG52YXIgQ2xpY2thYmxlSGVscGVyID0gZnVuY3Rpb24gKGVudGl0eSwgd2lkdGgsIGhlaWdodCwgcG9zaXRpb24sIGltYWdlLCBtb3ZlLCBjbGljaywgcmVsZWFzZSkge1xyXG4gIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICB0aGlzLmltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgdGhpcy5pbWFnZS5zcmMgPSBpbWFnZTtcclxuICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcbiAgdGhpcy5lbnRpdHkgPSBlbnRpdHk7XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXAgPSBDb25zdGFudHMuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgLSAxO1xyXG5cclxuICB0aGlzLnJlY2FsY3VsYXRlUG9zaXRpb24oKTtcclxuXHJcbiAgaWYgKG1vdmUgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICBtb3ZlID0gZnVuY3Rpb24oKXt9O1xyXG4gIH1cclxuXHJcbiAgaWYgKGNsaWNrID09IHVuZGVmaW5lZCkge1xyXG4gICAgY2xpY2sgPSBmdW5jdGlvbigpe307XHJcbiAgfVxyXG5cclxuICBpZiAocmVsZWFzZSA9PSB1bmRlZmluZWQpIHtcclxuICAgIHJlbGVhc2UgPSBmdW5jdGlvbigpe307XHJcbiAgfVxyXG5cclxuICB0aGlzLm1vdmUgPSBtb3ZlLmJpbmQodGhpcyk7XHJcbiAgdGhpcy5jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY2xpY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICQoZG9jdW1lbnQpLm9uZSgnbW91c2V1cCcsIHRoaXMucmVsZWFzZSk7XHJcbiAgICAkKF9lbmdpbmUudmlld3BvcnQuY2FudmFzRWxlbWVudCkub24oJ21vdXNlbW92ZScsIHRoaXMubW92ZSk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5yZWxlYXNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmVsZWFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgJChfZW5naW5lLnZpZXdwb3J0LmNhbnZhc0VsZW1lbnQpLm9mZignbW91c2Vtb3ZlJywgdGhpcy5tb3ZlKTtcclxuICB9O1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbkNsaWNrYWJsZUhlbHBlci5wcm90b3R5cGUucmVjYWxjdWxhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgdyA9IHRoaXMuZW50aXR5LmdldFdpZHRoKCk7XHJcbiAgdmFyIGggPSB0aGlzLmVudGl0eS5nZXRIZWlnaHQoKTtcclxuXHJcbiAgdGhpcy54ID0gKHcgLyAyKSAqIHRoaXMucG9zaXRpb25bMF07XHJcbiAgdGhpcy55ID0gKGggLyAyKSAqIHRoaXMucG9zaXRpb25bMV07XHJcblxyXG4gIGlmKHRoaXMuZml4dHVyZSlcclxuICAgIHRoaXMuZW50aXR5LmJvZHkuRGVzdHJveUZpeHR1cmUodGhpcy5maXh0dXJlKTtcclxuXHJcbiAgdGhpcy5zaGFwZSA9IG5ldyBiMlBvbHlnb25TaGFwZSgpO1xyXG4gIHRoaXMuc2hhcGUuU2V0QXNCb3goXHJcbiAgICBfZW5naW5lLnZpZXdwb3J0LnRvU2NhbGUodGhpcy53aWR0aCAvIDIpLFxyXG4gICAgX2VuZ2luZS52aWV3cG9ydC50b1NjYWxlKHRoaXMuaGVpZ2h0IC8gMiksXHJcbiAgICBuZXcgYjJWZWMyKHRoaXMueCwgdGhpcy55KSxcclxuICAgIDBcclxuICApO1xyXG5cclxuICB0aGlzLmZpeHR1cmUgPSBuZXcgYjJGaXh0dXJlRGVmKCk7XHJcbiAgdGhpcy5maXh0dXJlLnNldF9zaGFwZSh0aGlzLnNoYXBlKTtcclxuXHJcbiAgdmFyIGZpbHRlckRhdGEgPSB0aGlzLmZpeHR1cmUuZ2V0X2ZpbHRlcigpO1xyXG4gIGZpbHRlckRhdGEuc2V0X2NhdGVnb3J5Qml0cygxIDw8IHRoaXMuY29sbGlzaW9uR3JvdXApO1xyXG4gIGZpbHRlckRhdGEuc2V0X21hc2tCaXRzKF9lbmdpbmUuY29sbGlzaW9uR3JvdXBzW3RoaXMuY29sbGlzaW9uR3JvdXBdLm1hc2spO1xyXG4gIHRoaXMuZml4dHVyZS5zZXRfZmlsdGVyKGZpbHRlckRhdGEpO1xyXG5cclxuICB0aGlzLmZpeHR1cmUgPSB0aGlzLmVudGl0eS5ib2R5LkNyZWF0ZUZpeHR1cmUodGhpcy5maXh0dXJlKTtcclxuXHJcbn07XHJcblxyXG5DbGlja2FibGVIZWxwZXIucHJvdG90eXBlLnRlc3RQb2ludCA9IGZ1bmN0aW9uICh4LCB5KSB7XHJcbiAgcmV0dXJuIHRoaXMuZml4dHVyZS5UZXN0UG9pbnQobmV3IGIyVmVjMih4LCB5KSk7XHJcbn07XHJcblxyXG5DbGlja2FibGVIZWxwZXIucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgY3R4LmRyYXdJbWFnZShcclxuICAgIHRoaXMuaW1hZ2UsXHJcbiAgICAtdGhpcy53aWR0aCAvIDIsXHJcbiAgICAtdGhpcy5oZWlnaHQgLyAyLFxyXG4gICAgdGhpcy53aWR0aCxcclxuICAgIHRoaXMuaGVpZ2h0XHJcbiAgKTtcclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWNrYWJsZUhlbHBlcjsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBDT0xMSVNJT05fR1JPVVBTX05VTUJFUjogMTYsXHJcbiAgTEFZRVJTX05VTUJFUjogMTAsXHJcbiAgREVGQVVMVF9TQ0FMRTogMSAvIDcwLFxyXG4gIEFVVE9fSURfUFJFRklYOiBcIkVudGl0eSBcIixcclxuICBTSEFQRV9NSU5fU0laRTogMC4yLFxyXG4gIFRJTUVfU1RFUDogNjAsXHJcblxyXG4gIFBPU0lUSU9OX1RPUF9MRUZUOiBbLTEsIC0xXSxcclxuICBQT1NJVElPTl9UT1A6IFswLCAtMV0sXHJcbiAgUE9TSVRJT05fVE9QX1JJR0hUOiBbMSwgLTFdLFxyXG4gIFBPU0lUSU9OX1JJR0hUOiBbMSwgMF0sXHJcbiAgUE9TSVRJT05fQk9UVE9NX1JJR0hUOiBbMSwgMV0sXHJcbiAgUE9TSVRJT05fQk9UVE9NOiBbMCwgMV0sXHJcbiAgUE9TSVRJT05fQk9UVE9NX0xFRlQ6IFstMSwgMV0sXHJcbiAgUE9TSVRJT05fTEVGVDogWy0xLCAwXSxcclxuXHJcbiAgc2lkZU9yZGVyOiBbXHJcbiAgICBbMCwgLTFdLFxyXG4gICAgWzEsIDBdLFxyXG4gICAgWzAsIDFdLFxyXG4gICAgWy0xLCAwXVxyXG4gIF1cclxufTsiLCJ2YXIgVUkgPSByZXF1aXJlKFwiLi91aS5qc1wiKTtcclxudmFyIFRvb2xzID0gcmVxdWlyZShcIi4vdG9vbHMuanNcIik7XHJcbnZhciBUb2tlbk1hbmFnZXIgPSByZXF1aXJlKFwiLi90b2tlbm1hbmFnZXIuanNcIik7XHJcbnZhciBDb25zdGFudHMgPSByZXF1aXJlKFwiLi9jb25zdGFudHMuanNcIik7XHJcblxyXG4vLyBFTkdJTkVcclxuXHJcbi8vIGNvbnN0cnVjdG9yXHJcblxyXG52YXIgRW5naW5lID0gZnVuY3Rpb24gKHZpZXdwb3J0LCBncmF2aXR5KSB7XHJcbiAgdGhpcy52aWV3cG9ydCA9IHZpZXdwb3J0O1xyXG4gIHRoaXMuc2VsZWN0ZWRFbnRpdHkgPSBudWxsO1xyXG4gIHRoaXMuc2VsZWN0ZWRUb29sID0gVG9vbHMuU2VsZWN0aW9uO1xyXG5cclxuICB0aGlzLmhlbHBlcnMgPSBbXTtcclxuXHJcbiAgdGhpcy5idWZmZXJWZWMyID0gbmV3IGIyVmVjMigwLCAwKTtcclxuXHJcbiAgdGhpcy5sYXllcnMgPSBuZXcgQXJyYXkoQ29uc3RhbnRzLkxBWUVSU19OVU1CRVIpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgQ29uc3RhbnRzLkxBWUVSU19OVU1CRVI7IGkrKykge1xyXG4gICAgdGhpcy5sYXllcnNbaV0gPSBbXTtcclxuICB9XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXBzID0gW107XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBDb25zdGFudHMuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgLSAxOyBpKyspIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzLnB1c2goe1xyXG4gICAgICBcIm5hbWVcIjogaSArIDEsXHJcbiAgICAgIFwibWFza1wiOiBwYXJzZUludChcIjBcIiArIEFycmF5KENvbnN0YW50cy5DT0xMSVNJT05fR1JPVVBTX05VTUJFUikuam9pbihcIjFcIiksIDIpXHJcbiAgICB9KTtcclxuICB9XHJcbiAgdGhpcy5jb2xsaXNpb25Hcm91cHMucHVzaCh7XHJcbiAgICBcIm5hbWVcIjogXCJIZWxwZXJzXCIsXHJcbiAgICBcIm1hc2tcIjogcGFyc2VJbnQoQXJyYXkoQ29uc3RhbnRzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSICsgMSkuam9pbihcIjBcIiksIDIpXHJcbiAgfSk7XHJcblxyXG4gIHRoaXMubGlmZXRpbWVFbnRpdGllcyA9IDA7XHJcblxyXG4gIHRoaXMud29ybGQgPSBuZXcgYjJXb3JsZChncmF2aXR5LCB0cnVlKTtcclxuICB0aGlzLndvcmxkLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gIHRoaXMudG9rZW5NYW5hZ2VyID0gbmV3IFRva2VuTWFuYWdlcigpO1xyXG5cclxuICB2YXIgSW5wdXQgPSByZXF1aXJlKCcuL2lucHV0LmpzJyk7XHJcbiAgdGhpcy5pbnB1dCA9IG5ldyBJbnB1dCh2aWV3cG9ydCk7XHJcblxyXG4gICQodmlld3BvcnQuY2FudmFzRWxlbWVudCkub24oXCJtb3VzZWRvd25cIiwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuc2VsZWN0ZWRUb29sLm9uY2xpY2soKTtcclxuICB9KS5iaW5kKHRoaXMpKTtcclxuICAkKHZpZXdwb3J0LmNhbnZhc0VsZW1lbnQpLm9uKFwibW91c2V1cFwiLCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5zZWxlY3RlZFRvb2wub25yZWxlYXNlKCk7XHJcbiAgfSkuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vLyBDaGFuZ2VzIHJ1bm5pbmcgc3RhdGUgb2YgdGhlIHNpbXVsYXRpb25cclxuRW5naW5lLnByb3RvdHlwZS50b2dnbGVQYXVzZSA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLndvcmxkLnBhdXNlZCA9ICF0aGlzLndvcmxkLnBhdXNlZDtcclxuICB0aGlzLnNlbGVjdEVudGl0eShudWxsKTtcclxuXHJcbiAgdGhpcy5zZWxlY3RUb29sKHRoaXMud29ybGQucGF1c2VkID8gVG9vbHMuU2VsZWN0aW9uIDogVG9vbHMuQmxhbmspO1xyXG4gICQoXCIjc2VsZWN0aW9uVG9vbFwiKVswXS5jaGVja2VkID0gdHJ1ZTtcclxuXHJcbiAgaWYgKCF0aGlzLndvcmxkLnBhdXNlZCkge1xyXG4gICAgdmFyIGVudGl0aWVzID0gdGhpcy5lbnRpdGllcygpO1xyXG5cclxuICAgIGVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gICAgICBlbnRpdHkuYm9keS5TZXRBd2FrZSgxKTtcclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbkVuZ2luZS5wcm90b3R5cGUudmVjMiA9IGZ1bmN0aW9uICh4LCB5KSB7XHJcbiAgdGhpcy5idWZmZXJWZWMyLnNldF94KHgpO1xyXG4gIHRoaXMuYnVmZmVyVmVjMi5zZXRfeSh5KTtcclxuXHJcbiAgcmV0dXJuIHRoaXMuYnVmZmVyVmVjMjtcclxufTtcclxuXHJcbkVuZ2luZS5wcm90b3R5cGUuc2VsZWN0VG9vbCA9IGZ1bmN0aW9uICh0b29sKSB7XHJcbiAgdGhpcy5zZWxlY3RlZFRvb2wgPSB0b29sO1xyXG4gIHRoaXMuc2VsZWN0RW50aXR5KG51bGwpO1xyXG59O1xyXG5cclxuRW5naW5lLnByb3RvdHlwZS5yZW1vdmVFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgdGhpcy5zZWxlY3RFbnRpdHkobnVsbCk7XHJcbiAgdGhpcy53b3JsZC5EZXN0cm95Qm9keShlbnRpdHkuYm9keSk7XHJcbiAgdGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5zcGxpY2UodGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5pbmRleE9mKGVudGl0eSksIDEpO1xyXG59O1xyXG5cclxuRW5naW5lLnByb3RvdHlwZS5zZXRFbnRpdHlMYXllciA9IGZ1bmN0aW9uIChlbnRpdHksIG5ld0xheWVyKSB7XHJcbiAgLy8gUmVtb3ZlIGZyb20gb2xkIGxheWVyXHJcbiAgdGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5zcGxpY2UodGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5pbmRleE9mKGVudGl0eSksIDEpO1xyXG5cclxuICAvLyBTZXQgbmV3IGxheWVyXHJcbiAgZW50aXR5LmxheWVyID0gbmV3TGF5ZXI7XHJcbiAgdGhpcy5sYXllcnNbbmV3TGF5ZXJdLnB1c2goZW50aXR5KTtcclxufTtcclxuXHJcbi8vIFJldHVybnMgYWxsIGVudGl0aWVzIGluIG9uZSBhcnJheVxyXG5FbmdpbmUucHJvdG90eXBlLmVudGl0aWVzID0gZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiBbXS5jb25jYXQuYXBwbHkoW10sIHRoaXMubGF5ZXJzKTtcclxufTtcclxuXHJcblxyXG4vLyBSZXR1cm5zIHRoZSBlbnRpdHkgd2l0aCBpZCBzcGVjaWZpZWQgYnkgYXJndW1lbnRcclxuRW5naW5lLnByb3RvdHlwZS5nZXRFbnRpdHlCeUlkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgdmFyIGVudGl0aWVzID0gdGhpcy5lbnRpdGllcygpO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoZW50aXRpZXNbaV0uaWQgPT09IGlkKVxyXG4gICAgICByZXR1cm4gZW50aXRpZXNbaV07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbi8vIFJldHVybnMgYW4gYXJyYXkgb2YgZW50aXRpZXMgd2l0aCBzcGVjaWZpZWQgY29sbGlzaW9uR3JvdXBcclxuRW5naW5lLnByb3RvdHlwZS5nZXRFbnRpdGllc0J5Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcclxuICB2YXIgcmV0ID0gW107XHJcbiAgdmFyIGVudGl0aWVzID0gdGhpcy5lbnRpdGllcygpO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoZW50aXRpZXNbaV0uY29sbGlzaW9uR3JvdXAgPT09IGdyb3VwKVxyXG4gICAgICByZXQucHVzaChlbnRpdGllc1tpXSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuLy8gQWRkaW5nIGFuIGVudGl0eSB0byB0aGUgd29ybGRcclxuRW5naW5lLnByb3RvdHlwZS5hZGRFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5LCB0eXBlKSB7XHJcbiAgLy8gZ2VuZXJhdGUgYXV0byBpZFxyXG4gIGlmIChlbnRpdHkuaWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgZW50aXR5LmlkID0gQ29uc3RhbnRzLkFVVE9fSURfUFJFRklYICsgdGhpcy5saWZldGltZUVudGl0aWVzO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5saWZldGltZUVudGl0aWVzKys7XHJcblxyXG4gIGVudGl0eS5ib2R5LnNldF90eXBlKHR5cGUpO1xyXG5cclxuICBlbnRpdHkuYm9keSA9IHRoaXMud29ybGQuQ3JlYXRlQm9keShlbnRpdHkuYm9keSk7XHJcbiAgZW50aXR5LmZpeHR1cmUgPSBlbnRpdHkuYm9keS5DcmVhdGVGaXh0dXJlKGVudGl0eS5maXh0dXJlKTtcclxuXHJcbiAgdGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5wdXNoKGVudGl0eSk7XHJcblxyXG4gIGVudGl0eS5hZGRIZWxwZXJzKCk7XHJcblxyXG4gIHJldHVybiBlbnRpdHk7XHJcbn07XHJcblxyXG4vLyBDaGVja3Mgd2hldGhlciB0d28gZ3JvdXBzIHNob3VsZCBjb2xsaWRlXHJcbkVuZ2luZS5wcm90b3R5cGUuZ2V0Q29sbGlzaW9uID0gZnVuY3Rpb24gKGdyb3VwQSwgZ3JvdXBCKSB7XHJcbiAgcmV0dXJuICh0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEFdLm1hc2sgPj4gZ3JvdXBCKSAmIDE7XHJcbn07XHJcblxyXG4vLyBTZXRzIHR3byBncm91cHMgdXAgdG8gY29sbGlkZVxyXG5FbmdpbmUucHJvdG90eXBlLnNldENvbGxpc2lvbiA9IGZ1bmN0aW9uIChncm91cEEsIGdyb3VwQiwgdmFsdWUpIHtcclxuICB2YXIgbWFza0EgPSAoMSA8PCBncm91cEIpO1xyXG4gIHZhciBtYXNrQiA9ICgxIDw8IGdyb3VwQSk7XHJcblxyXG4gIGlmICh2YWx1ZSkge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrIHwgbWFza0E7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgPSB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgfCBtYXNrQjtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrICYgfm1hc2tBO1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrICYgfm1hc2tCO1xyXG4gIH1cclxuICB0aGlzLnVwZGF0ZUNvbGxpc2lvbnMoKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vLyBDaGFuZ2VzIHRoZSBJRCBvZiBhbiBlbnRpdHlcclxuRW5naW5lLnByb3RvdHlwZS5jaGFuZ2VJZCA9IGZ1bmN0aW9uIChlbnRpdHksIGlkKSB7XHJcbiAgZW50aXR5LmlkID0gaWQ7XHJcbn07XHJcblxyXG4vLyBTZWxlY3RzIGFuIGVudGl0eSBhbmQgc2hvd3MgaXRzIHByb3BlcnRpZXMgaW4gdGhlIHNpZGViYXJcclxuRW5naW5lLnByb3RvdHlwZS5zZWxlY3RFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgdGhpcy5zZWxlY3RlZEVudGl0eSA9IGVudGl0eTtcclxuXHJcbiAgVUkuYnVpbGRTaWRlYmFyKHRoaXMuc2VsZWN0ZWRFbnRpdHkpO1xyXG59O1xyXG5cclxuLy8gVXBkYXRlcyBjb2xsaXNpb24gbWFza3MgZm9yIGFsbCBlbnRpdGllcywgYmFzZWQgb24gZW5naW5lJ3MgY29sbGlzaW9uR3JvdXBzIHRhYmxlXHJcbkVuZ2luZS5wcm90b3R5cGUudXBkYXRlQ29sbGlzaW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgZW50aXRpZXMgPSB0aGlzLmVudGl0aWVzKCk7XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHRoaXMudXBkYXRlQ29sbGlzaW9uKGVudGl0aWVzW2ldKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy8gVXBkYXRlcyBjb2xsaXNpb24gbWFzayBmb3IgYW4gZW50aXR5LCBiYXNlZCBvbiBlbmdpbmUncyBjb2xsaXNpb25Hcm91cHMgdGFibGVcclxuRW5naW5lLnByb3RvdHlwZS51cGRhdGVDb2xsaXNpb24gPSBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgdmFyIGZpbHRlckRhdGEgPSBlbnRpdHkuZml4dHVyZS5HZXRGaWx0ZXJEYXRhKCk7XHJcbiAgZmlsdGVyRGF0YS5zZXRfbWFza0JpdHModGhpcy5jb2xsaXNpb25Hcm91cHNbZW50aXR5LmNvbGxpc2lvbkdyb3VwXS5tYXNrKTtcclxuICBlbnRpdHkuZml4dHVyZS5TZXRGaWx0ZXJEYXRhKGZpbHRlckRhdGEpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8vIE9uZSBzaW11bGF0aW9uIHN0ZXAuIFNpbXVsYXRpb24gbG9naWMgaGFwcGVucyBoZXJlLlxyXG5FbmdpbmUucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgLy8gRlBTIHRpbWVyXHJcbiAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgY3R4ID0gdGhpcy52aWV3cG9ydC5jb250ZXh0O1xyXG5cclxuICAvLyBjbGVhciBzY3JlZW5cclxuICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMudmlld3BvcnQud2lkdGgsIHRoaXMudmlld3BvcnQuaGVpZ2h0KTtcclxuXHJcbiAgY3R4LnNhdmUoKTtcclxuXHJcbiAgaWYgKCFfZW5naW5lLndvcmxkLnBhdXNlZCkge1xyXG4gICAgLy8gYm94MmQgc2ltdWxhdGlvbiBzdGVwXHJcbiAgICB0aGlzLndvcmxkLlN0ZXAoMSAvIENvbnN0YW50cy5USU1FX1NURVAsIDEwLCA1KTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICB0aGlzLnNlbGVjdGVkVG9vbC5vbm1vdmUoY3R4KTtcclxuICB9XHJcblxyXG4gIC8vIGRyYXcgYWxsIGVudGl0aWVzXHJcbiAgZm9yICh2YXIgbGF5ZXIgPSAwOyBsYXllciA8IENvbnN0YW50cy5MQVlFUlNfTlVNQkVSOyBsYXllcisrKSB7XHJcbiAgICBmb3IgKHZhciBlbnRpdHkgPSB0aGlzLmxheWVyc1tsYXllcl0ubGVuZ3RoIC0gMTsgZW50aXR5ID49IDA7IGVudGl0eS0tKSB7XHJcbiAgICAgIHRoaXMuZHJhd0VudGl0eSh0aGlzLmxheWVyc1tsYXllcl1bZW50aXR5XSwgY3R4KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICh0aGlzLnNlbGVjdGVkRW50aXR5KSB7XHJcbiAgICB0aGlzLmRyYXdCb3VuZGFyeShjdHgpO1xyXG4gICAgdGhpcy5kcmF3SGVscGVycyh0aGlzLnNlbGVjdGVkRW50aXR5LCBjdHgpO1xyXG4gIH1cclxuXHJcbiAgLy8gUmVsZWFzZWQga2V5cyBhcmUgb25seSB0byBiZSBwcm9jZXNzZWQgb25jZVxyXG4gIHRoaXMuaW5wdXQuY2xlYW5VcCgpO1xyXG5cclxuICB2YXIgZW5kID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgLy8gQ2FsbCBuZXh0IHN0ZXBcclxuICBzZXRUaW1lb3V0KHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xyXG4gICAgX2VuZ2luZS5zdGVwKCk7XHJcbiAgfSksIE1hdGgubWluKENvbnN0YW50cy5USU1FX1NURVAgLSBlbmQgLSBzdGFydCwgMCkpO1xyXG59O1xyXG5cclxuRW5naW5lLnByb3RvdHlwZS5kcmF3Qm91bmRhcnkgPSBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgdmFyIGhhbGZXaWR0aCA9IHRoaXMuc2VsZWN0ZWRFbnRpdHkuZ2V0V2lkdGgoKSAvIDI7XHJcbiAgdmFyIGhhbGZIZWlnaHQgPSB0aGlzLnNlbGVjdGVkRW50aXR5LmdldEhlaWdodCgpIC8gMjtcclxuICB2YXIgeCA9IHRoaXMuc2VsZWN0ZWRFbnRpdHkuZ2V0WCgpO1xyXG4gIHZhciB5ID0gdGhpcy5zZWxlY3RlZEVudGl0eS5nZXRZKCk7XHJcblxyXG4gIGN0eC5zYXZlKCk7XHJcblxyXG4gIGN0eC50cmFuc2xhdGUoXHJcbiAgICB0aGlzLnZpZXdwb3J0LmZyb21TY2FsZSgtdGhpcy52aWV3cG9ydC54ICsgeCkgKyB0aGlzLnZpZXdwb3J0LndpZHRoIC8gMixcclxuICAgIHRoaXMudmlld3BvcnQuZnJvbVNjYWxlKC10aGlzLnZpZXdwb3J0LnkgKyB5KSArIHRoaXMudmlld3BvcnQuaGVpZ2h0IC8gMik7XHJcblxyXG4gIGN0eC5yb3RhdGUodGhpcy5zZWxlY3RlZEVudGl0eS5ib2R5LkdldEFuZ2xlKCkpO1xyXG5cclxuICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gXCJ4b3JcIjtcclxuICBjdHguc3Ryb2tlUmVjdChcclxuICAgIHRoaXMudmlld3BvcnQuZnJvbVNjYWxlKC1oYWxmV2lkdGgpLFxyXG4gICAgdGhpcy52aWV3cG9ydC5mcm9tU2NhbGUoLWhhbGZIZWlnaHQpLFxyXG4gICAgdGhpcy52aWV3cG9ydC5mcm9tU2NhbGUoMiAqIGhhbGZXaWR0aCksXHJcbiAgICB0aGlzLnZpZXdwb3J0LmZyb21TY2FsZSgyICogaGFsZkhlaWdodClcclxuICApO1xyXG5cclxuICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRW5naW5lLnByb3RvdHlwZS5kcmF3SGVscGVycyA9IGZ1bmN0aW9uIChlbnRpdHksIGN0eCkge1xyXG4gIGN0eC5zYXZlKCk7XHJcblxyXG4gIHZhciBlbnRpdHlYID0gZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpO1xyXG4gIHZhciBlbnRpdHlZID0gZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpO1xyXG5cclxuICBjdHgudHJhbnNsYXRlKFxyXG4gICAgdGhpcy52aWV3cG9ydC5mcm9tU2NhbGUoLXRoaXMudmlld3BvcnQueCArIGVudGl0eVgpICsgdGhpcy52aWV3cG9ydC53aWR0aCAvIDIsXHJcbiAgICB0aGlzLnZpZXdwb3J0LmZyb21TY2FsZSgtdGhpcy52aWV3cG9ydC55ICsgZW50aXR5WSkgKyB0aGlzLnZpZXdwb3J0LmhlaWdodCAvIDIpO1xyXG4gIGN0eC5yb3RhdGUoZW50aXR5LmJvZHkuR2V0QW5nbGUoKSk7XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXR5LmhlbHBlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgdmFyIHggPSBlbnRpdHkuaGVscGVyc1tpXS54O1xyXG4gICAgdmFyIHkgPSBlbnRpdHkuaGVscGVyc1tpXS55O1xyXG5cclxuICAgIGN0eC50cmFuc2xhdGUodGhpcy52aWV3cG9ydC5mcm9tU2NhbGUoeCksIHRoaXMudmlld3BvcnQuZnJvbVNjYWxlKHkpKTtcclxuXHJcbiAgICBlbnRpdHkuaGVscGVyc1tpXS5kcmF3KGN0eCk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICB9XHJcbiAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbkVuZ2luZS5wcm90b3R5cGUuZHJhd0VudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHksIGN0eCkge1xyXG4gIGN0eC5zYXZlKCk7XHJcblxyXG4gIHZhciB4ID0gZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpO1xyXG4gIHZhciB5ID0gZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpO1xyXG5cclxuICBjdHgudHJhbnNsYXRlKFxyXG4gICAgdGhpcy52aWV3cG9ydC5mcm9tU2NhbGUoLXRoaXMudmlld3BvcnQueCArIHgpICsgdGhpcy52aWV3cG9ydC53aWR0aCAvIDIsXHJcbiAgICB0aGlzLnZpZXdwb3J0LmZyb21TY2FsZSgtdGhpcy52aWV3cG9ydC55ICsgeSkgKyB0aGlzLnZpZXdwb3J0LmhlaWdodCAvIDIpO1xyXG5cclxuICBjdHgucm90YXRlKGVudGl0eS5ib2R5LkdldEFuZ2xlKCkpO1xyXG5cclxuICBpZiAoZW50aXR5ID09PSB0aGlzLnNlbGVjdGVkRW50aXR5KVxyXG4gICAgY3R4Lmdsb2JhbEFscGhhID0gMTtcclxuXHJcbiAgY3R4LmZpbGxTdHlsZSA9IGVudGl0eS5jb2xvcjtcclxuICBlbnRpdHkuZHJhdyhjdHgpO1xyXG5cclxuICBjdHgucmVzdG9yZSgpO1xyXG5cclxuICBmb3IgKHZhciBqID0gMDsgaiA8IGVudGl0eS5iZWhhdmlvcnMubGVuZ3RoOyBqKyspIHtcclxuICAgIHZhciBiZWhhdmlvciA9IGVudGl0eS5iZWhhdmlvcnNbal07XHJcblxyXG4gICAgaWYgKGJlaGF2aW9yLmNoZWNrKGVudGl0eSkpXHJcbiAgICAgIGJlaGF2aW9yLnJlc3VsdCgpO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTtcclxuXHJcblxyXG4iLCIvLyBFTlRJVFlcclxudmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHMuanNcIik7XHJcbnZhciBDb25zdGFudHMgPSByZXF1aXJlKFwiLi9jb25zdGFudHMuanNcIik7XHJcbnZhciBHZW9tZXRyeSA9IHJlcXVpcmUoXCIuL2dlb21ldHJ5LmpzXCIpO1xyXG5cclxudmFyIEFVVE9fQ09MT1JfUkFOR0UgPSBbMCwgMjMwXTtcclxuXHJcbnZhciBFbnRpdHkgPSBmdW5jdGlvbiAoc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCkge1xyXG4gIHRoaXMuaWQgPSBpZDtcclxuICB0aGlzLmRlYWQgPSBmYWxzZTtcclxuICB0aGlzLmxheWVyID0gMDtcclxuICB0aGlzLmhlbHBlcnMgPSBbXTtcclxuXHJcbiAgdGhpcy5maXhlZFJvdGF0aW9uID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXAgPSBjb2xsaXNpb25Hcm91cDtcclxuICBpZiAodGhpcy5jb2xsaXNpb25Hcm91cCA9PSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXAgPSAwO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5iZWhhdmlvcnMgPSBbXTtcclxuXHJcbiAgdGhpcy5maXh0dXJlID0gZml4dHVyZTtcclxuICBpZiAodGhpcy5maXh0dXJlID09IHVuZGVmaW5lZCkge1xyXG4gICAgdmFyIGZpeCA9IG5ldyBiMkZpeHR1cmVEZWYoKTtcclxuICAgIGZpeC5zZXRfZGVuc2l0eSgxMCk7XHJcbiAgICBmaXguc2V0X2ZyaWN0aW9uKDAuNSk7XHJcbiAgICBmaXguc2V0X3Jlc3RpdHV0aW9uKDAuMik7XHJcblxyXG4gICAgdGhpcy5maXh0dXJlID0gZml4O1xyXG4gIH1cclxuICB0aGlzLmZpeHR1cmUuc2V0X3NoYXBlKHNoYXBlKTtcclxuXHJcbiAgdmFyIGZpbHRlckRhdGEgPSB0aGlzLmZpeHR1cmUuZ2V0X2ZpbHRlcigpO1xyXG4gIGZpbHRlckRhdGEuc2V0X2NhdGVnb3J5Qml0cygxIDw8IGNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgLy8gQ29uc3RydWN0b3IgaXMgY2FsbGVkIHdoZW4gaW5oZXJpdGluZywgc28gd2UgbmVlZCB0byBjaGVjayBmb3IgX2VuZ2luZSBhdmFpbGFiaWxpdHlcclxuICBpZiAodHlwZW9mIF9lbmdpbmUgIT09ICd1bmRlZmluZWQnKVxyXG4gICAgZmlsdGVyRGF0YS5zZXRfbWFza0JpdHMoX2VuZ2luZS5jb2xsaXNpb25Hcm91cHNbdGhpcy5jb2xsaXNpb25Hcm91cF0ubWFzayk7XHJcblxyXG4gIHRoaXMuZml4dHVyZS5zZXRfZmlsdGVyKGZpbHRlckRhdGEpO1xyXG5cclxuICB0aGlzLmJvZHkgPSBib2R5O1xyXG4gIGlmICh0aGlzLmJvZHkgIT09IHVuZGVmaW5lZClcclxuICAgIHRoaXMuYm9keS5zZXRfZml4ZWRSb3RhdGlvbihmYWxzZSk7XHJcblxyXG4gIC8vIEF1dG8gZ2VuZXJhdGUgY29sb3JcclxuICB2YXIgciA9IFV0aWxzLnJhbmRvbVJhbmdlKEFVVE9fQ09MT1JfUkFOR0VbMF0sIEFVVE9fQ09MT1JfUkFOR0VbMV0pLnRvU3RyaW5nKDE2KTtcclxuICByID0gci5sZW5ndGggPT0gMSA/IFwiMFwiICsgciA6IHI7XHJcbiAgdmFyIGcgPSBVdGlscy5yYW5kb21SYW5nZShBVVRPX0NPTE9SX1JBTkdFWzBdLCBBVVRPX0NPTE9SX1JBTkdFWzFdKS50b1N0cmluZygxNik7XHJcbiAgZyA9IGcubGVuZ3RoID09IDEgPyBcIjBcIiArIGcgOiBnO1xyXG4gIHZhciBiID0gVXRpbHMucmFuZG9tUmFuZ2UoQVVUT19DT0xPUl9SQU5HRVswXSwgQVVUT19DT0xPUl9SQU5HRVsxXSkudG9TdHJpbmcoMTYpO1xyXG4gIGIgPSBiLmxlbmd0aCA9PSAxID8gXCIwXCIgKyBiIDogYjtcclxuICB0aGlzLmNvbG9yID0gXCIjXCIgKyByICsgZyArIGI7XHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmdldFggPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHRoaXMuYm9keS5HZXRQb3NpdGlvbigpLmdldF94KCk7XHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmdldFkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHRoaXMuYm9keS5HZXRQb3NpdGlvbigpLmdldF95KCk7XHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmdldFdpZHRoID0gZnVuY3Rpb24gKCkge1xyXG4gIHRocm93IFwiRVJST1IhIENhbm5vdCBnZXQgd2lkdGg6IFVzZSBkZXJpdmVkIGNsYXNzLlwiO1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRIZWlnaHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdGhyb3cgXCJFUlJPUiEgQ2Fubm90IGdldCBoZWlnaHQ6IFVzZSBkZXJpdmVkIGNsYXNzLlwiO1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5hZGRIZWxwZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gIHRocm93IFwiRVJST1IhIENhbm5vdCBhZGQgaGVscGVyczogVXNlIGRlcml2ZWQgY2xhc3MuXCI7XHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnJlY2FsY3VsYXRlSGVscGVycyA9IGZ1bmN0aW9uICgpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaGVscGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgdGhpcy5oZWxwZXJzW2ldLnJlY2FsY3VsYXRlUG9zaXRpb24oKTtcclxuICB9XHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmdldFNpZGUgPSBmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuICB2YXIgY2VudGVyWCA9IHRoaXMuZ2V0WCgpO1xyXG4gIHZhciBjZW50ZXJZID0gdGhpcy5nZXRZKCk7XHJcbiAgdmFyIGNlbnRlciA9IG5ldyBiMlZlYzIoY2VudGVyWCwgY2VudGVyWSk7XHJcbiAgdmFyIHdpZHRoID0gdGhpcy5nZXRXaWR0aCgpO1xyXG4gIHZhciBoZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpO1xyXG5cclxuICB2YXIgcm90YXRpb24gPSBDb25zdGFudHMuc2lkZU9yZGVyLmVxdWFsSW5kZXhPZihwb3NpdGlvbikgKiAoTWF0aC5QSSAvIDIpO1xyXG4gIHZhciB0b3BBID0gbmV3IGIyVmVjMihjZW50ZXJYIC0gKHdpZHRoIC8gMiksIGNlbnRlclkgLSAoaGVpZ2h0IC8gMikpO1xyXG4gIHZhciB0b3BCID0gbmV3IGIyVmVjMihjZW50ZXJYICsgKHdpZHRoIC8gMiksIGNlbnRlclkgLSAoaGVpZ2h0IC8gMikpO1xyXG4gIHZhciBhID0gR2VvbWV0cnkucG9pbnRSb3RhdGUoY2VudGVyLCB0b3BBLCByb3RhdGlvbik7XHJcbiAgdmFyIGIgPSBHZW9tZXRyeS5wb2ludFJvdGF0ZShjZW50ZXIsIHRvcEIsIHJvdGF0aW9uKTtcclxuXHJcbiAgcmV0dXJuIFthLCBiXTtcclxufTtcclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24gKCkge1xyXG4gIHRoaXMuZGVhZCA9IHRydWU7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKCkge1xyXG4gIHRocm93IFwiRVJST1IhIENhbm5vdCBkcmF3IEVudGl0eTogVXNlIGRlcml2ZWQgY2xhc3Nlcy5cIjtcclxufTtcclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0Q29sb3IgPSBmdW5jdGlvbiAoY29sb3IpIHtcclxuICB0aGlzLmNvbG9yID0gY29sb3I7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRJZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gIHRoaXMuaWQgPSBpZDtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRDb2xsaXNpb25Hcm91cCA9IGZ1bmN0aW9uIChncm91cCkge1xyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXAgPSBncm91cDtcclxuXHJcbiAgdmFyIGZpbHRlckRhdGEgPSB0aGlzLmZpeHR1cmUuR2V0RmlsdGVyRGF0YSgpO1xyXG4gIGZpbHRlckRhdGEuc2V0X2NhdGVnb3J5Qml0cygxIDw8IGdyb3VwKTtcclxuICB0aGlzLmZpeHR1cmUuU2V0RmlsdGVyRGF0YShmaWx0ZXJEYXRhKTtcclxuXHJcbiAgX2VuZ2luZS51cGRhdGVDb2xsaXNpb24odGhpcyk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRMaW5lYXJWZWxvY2l0eSA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gdGhpcy5ib2R5LkdldExpbmVhclZlbG9jaXR5KCk7XHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmdldE1hc3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIE1hdGgubWF4KDEsIHRoaXMuYm9keS5HZXRNYXNzKCkpO1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRMaW5lYXJWZWxvY2l0eSA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcclxuICB0aGlzLmJvZHkuU2V0TGluZWFyVmVsb2NpdHkodmVjdG9yKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFwcGx5VG9ycXVlID0gZnVuY3Rpb24gKGZvcmNlKSB7XHJcbiAgdGhpcy5ib2R5LkFwcGx5VG9ycXVlKGZvcmNlKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFwcGx5TGluZWFySW1wdWxzZSA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcclxuICB0aGlzLmJvZHkuQXBwbHlMaW5lYXJJbXB1bHNlKHZlY3RvciwgdGhpcy5ib2R5LkdldFdvcmxkQ2VudGVyKCkpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZGlzYWJsZVJvdGF0aW9uID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgdGhpcy5maXhlZFJvdGF0aW9uID0gdmFsdWU7XHJcbiAgdGhpcy5ib2R5LlNldEZpeGVkUm90YXRpb24odmFsdWUpXHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5hZGRCZWhhdmlvciA9IGZ1bmN0aW9uIChiZWhhdmlvcikge1xyXG4gIHRoaXMuYmVoYXZpb3JzLnB1c2goYmVoYXZpb3IpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVudGl0eTsiLCJ2YXIgRW50aXR5RmlsdGVyID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuRW50aXR5RmlsdGVyO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBbXTtcclxuXHJcbnZhciBlZkJ5SWQgPSBmdW5jdGlvbihpZCkge1xyXG4gIEVudGl0eUZpbHRlci5jYWxsKHRoaXMsIFwiZmlsdGVyQnlJZFwiLCBhcmd1bWVudHMsIFtUeXBlLlNUUklOR10pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChpZCk7XHJcbn07XHJcbmVmQnlJZC5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcblxyXG5lZkJ5SWQucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkuaWQgPT09IHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xyXG59O1xyXG5cclxuZWZCeUlkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGVmQnlJZDtcclxubW9kdWxlLmV4cG9ydHMucHVzaChlZkJ5SWQpO1xyXG5cclxuXHJcbnZhciBlZkJ5Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gIEVudGl0eUZpbHRlci5jYWxsKHRoaXMsIFwiZmlsdGVyQnlHcm91cFwiLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChncm91cCk7XHJcbn07XHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcblxyXG5lZkJ5Q29sbGlzaW9uR3JvdXAucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkuY29sbGlzaW9uR3JvdXAgKyAxID09PSB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKTtcclxufTtcclxuXHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBlZkJ5Q29sbGlzaW9uR3JvdXA7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goZWZCeUNvbGxpc2lvbkdyb3VwKTtcclxuXHJcblxyXG52YXIgZWZCeUxheWVyID0gZnVuY3Rpb24obGF5ZXIpIHtcclxuICBFbnRpdHlGaWx0ZXIuY2FsbCh0aGlzLCBcImZpbHRlckJ5TGF5ZXJcIiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2gobGF5ZXIpO1xyXG59O1xyXG5lZkJ5TGF5ZXIucHJvdG90eXBlID0gbmV3IEVudGl0eUZpbHRlcigpO1xyXG5cclxuZWZCeUxheWVyLnByb3RvdHlwZS5kZWNpZGUgPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICByZXR1cm4gZW50aXR5LmxheWVyICsgMSA9PT0gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCk7XHJcbn07XHJcblxyXG5lZkJ5TGF5ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gZWZCeUxheWVyO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGVmQnlMYXllcik7IiwicmVxdWlyZShcIi4vdHJhbnNsYXRpb25zLmpzXCIpO1xyXG5yZXF1aXJlKFwiLi9pbnB1dC5qc1wiKTtcclxuXHJcbnZhciBFbmdpbmUgPSByZXF1aXJlKFwiLi9lbmdpbmUuanNcIik7XHJcbnZhciBWaWV3cG9ydCA9IHJlcXVpcmUoXCIuL3ZpZXdwb3J0LmpzXCIpO1xyXG52YXIgVUkgPSByZXF1aXJlKFwiLi91aS5qc1wiKTtcclxudmFyIEJvZHlUeXBlID0gcmVxdWlyZShcIi4vYm9keXR5cGUuanNcIik7XHJcbnZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xyXG5cclxudmFyIENpcmNsZSA9IHJlcXVpcmUoXCIuL3NoYXBlcy5qc1wiKS5DaXJjbGU7XHJcbnZhciBSZWN0YW5nbGUgPSByZXF1aXJlKFwiLi9zaGFwZXMuanNcIikuUmVjdGFuZ2xlO1xyXG5cclxuVUkuaW5pdGlhbGl6ZSgpO1xyXG5cclxud2luZG93Ll9lbmdpbmUgPSBuZXcgRW5naW5lKG5ldyBWaWV3cG9ydCgkKFwiI21haW5DYW52YXNcIilbMF0pLCBuZXcgYjJWZWMyKDAsIDEwKSk7XHJcblxyXG5cclxuLy8gX2VuZ2luZS5hZGRFbnRpdHkobmV3IENpcmNsZShuZXcgYjJWZWMyKDAsIDApLCAyKSwgQm9keVR5cGUuRFlOQU1JQ19CT0RZKVxyXG5fZW5naW5lLmFkZEVudGl0eShuZXcgUmVjdGFuZ2xlKG5ldyBiMlZlYzIoMCwgMCksIG5ldyBiMlZlYzIoMC41LCAwLjUpKSwgQm9keVR5cGUuRFlOQU1JQ19CT0RZKVxyXG4gIC5zZXRDb2xsaXNpb25Hcm91cCgyKVxyXG4gIC5zZXRJZChcImtydWhcIilcclxuICAuZGlzYWJsZVJvdGF0aW9uKGZhbHNlKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwiKCggZ2V0VmVsb2NpdHlYKCBmaWx0ZXJCeUlkKCB0ZXh0KCBcXFwia3J1aFxcXCIgKSApICkgKSA+IChudW1iZXIoIFxcXCItM1xcXCIgKSkpIEFORCAoaXNCdXR0b25Eb3duKCBudW1iZXIoIDM3ICkgKSApXCIpLFxyXG4gICAgICBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UoXCJhcHBseUxpbmVhckltcHVsc2UoIGZpbHRlckJ5SWQoIHRleHQoIFxcXCJrcnVoXFxcIiApICksIG51bWJlciggLTAuMyApLCBudW1iZXIoIDAgKSApXCIpXHJcbiAgICApXHJcbiAgKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwiKChnZXRWZWxvY2l0eVkoIGZpbHRlckJ5SWQoIHRleHQoIFxcXCJrcnVoXFxcIiApICkgKSkgPiAobnVtYmVyKCAtNSApKSkgQU5EIChpc0J1dHRvbkRvd24oIG51bWJlciggMzggKSApKVwiKSxcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwiYXBwbHlMaW5lYXJJbXB1bHNlKCBmaWx0ZXJCeUlkKCB0ZXh0KCBcXFwia3J1aFxcXCIgKSApLCBudW1iZXIoIDAgKSwgbnVtYmVyKCAtMC41ICkgKVwiKVxyXG4gICAgKVxyXG4gIClcclxuICAuYWRkQmVoYXZpb3IoXHJcbiAgICBuZXcgQmVoYXZpb3IoXHJcbiAgICAgIF9lbmdpbmUudG9rZW5NYW5hZ2VyLnBhcnNlci5wYXJzZShcIigoZ2V0VmVsb2NpdHlYKCBmaWx0ZXJCeUlkKCB0ZXh0KCBcXFwia3J1aFxcXCIgKSApICkpIDwgKG51bWJlciggMyApKSkgQU5EIChpc0J1dHRvbkRvd24oIG51bWJlciggMzkgKSApKVwiKSxcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwiYXBwbHlMaW5lYXJJbXB1bHNlKCBmaWx0ZXJCeUlkKCB0ZXh0KCBcXFwia3J1aFxcXCIgKSApLCBudW1iZXIoIDAuMyApLCBudW1iZXIoIDAgKSApXCIpXHJcbiAgICApXHJcbiAgKTtcclxuXHJcbl9lbmdpbmUuYWRkRW50aXR5KG5ldyBSZWN0YW5nbGUobmV3IGIyVmVjMigwLCAzKSwgbmV3IGIyVmVjMigyLCAwLjI1KSksIEJvZHlUeXBlLktJTkVNQVRJQ19CT0RZKVxyXG4gIC5zZXRJZChcInBsYXRmb3JtXCIpXHJcbiAgLnNldENvbGxpc2lvbkdyb3VwKDEpO1xyXG5cclxud2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICBfZW5naW5lLnN0ZXAoKTtcclxufSk7IiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgcG9pbnRQb2ludERpc3RhbmNlOiBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnBvaW50UG9pbnREaXN0YW5jZTIoYSwgYikpO1xyXG4gIH0sXHJcblxyXG4gIHBvaW50UG9pbnREaXN0YW5jZTI6IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICB2YXIgeDEgPSBhLmdldF94KCk7XHJcbiAgICB2YXIgeDIgPSBiLmdldF94KCk7XHJcbiAgICB2YXIgeTEgPSBhLmdldF95KCk7XHJcbiAgICB2YXIgeTIgPSBiLmdldF95KCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuc3F1YXJlKHgxIC0geDIpICsgdGhpcy5zcXVhcmUoeTEgLSB5Mik7XHJcbiAgfSxcclxuXHJcbiAgc3F1YXJlOiBmdW5jdGlvbiAoeCkge1xyXG4gICAgcmV0dXJuIHggKiB4O1xyXG4gIH0sXHJcblxyXG4gIGxpbmVQb2ludERpc3RhbmNlOiBmdW5jdGlvbiAobGluZUEsIGxpbmVCLCBwb2ludCkge1xyXG4gICAgdmFyIGxlbmd0aDIgPSB0aGlzLnBvaW50UG9pbnREaXN0YW5jZTIobGluZUEsIGxpbmVCKTtcclxuICAgIHZhciB4QSA9IGxpbmVBLmdldF94KCk7XHJcbiAgICB2YXIgeEIgPSBsaW5lQi5nZXRfeCgpO1xyXG4gICAgdmFyIHhQID0gcG9pbnQuZ2V0X3goKTtcclxuICAgIHZhciB5QSA9IGxpbmVBLmdldF95KCk7XHJcbiAgICB2YXIgeUIgPSBsaW5lQi5nZXRfeSgpO1xyXG4gICAgdmFyIHlQID0gcG9pbnQuZ2V0X3koKTtcclxuXHJcbiAgICBpZiAobGVuZ3RoMiA9PT0gMCkgcmV0dXJuIHRoaXMucG9pbnRQb2ludERpc3RhbmNlMihwb2ludCwgbGluZUEpO1xyXG5cclxuICAgIHZhciB0ID0gKCh4UCAtIHhBKSAqICh4QiAtIHhBKSArICh5UCAtIHlBKSAqICh5QiAtIHlBKSkgLyBsZW5ndGgyO1xyXG4gICAgdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHQpKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5wb2ludFBvaW50RGlzdGFuY2UocG9pbnQsIG5ldyBiMlZlYzIoeEEgKyB0ICogKHhCIC0geEEpLCB5QSArIHQgKiAoeUIgLSB5QSkpKTtcclxuICB9LFxyXG5cclxuICBwb2ludFJvdGF0ZTogZnVuY3Rpb24gKG9yaWdpbiwgcG9pbnQsIGFuZ2xlKSB7XHJcbiAgICBhbmdsZSA9IC1hbmdsZTsgLy8gQ2FydGVzaWFuIHRvIHNjcmVlbiBjb29yZGluYXRlIHN5c3RlbVxyXG4gICAgdmFyIGNvcyA9IE1hdGguY29zKGFuZ2xlKTtcclxuICAgIHZhciBzaW4gPSBNYXRoLnNpbihhbmdsZSk7XHJcbiAgICB2YXIgb3ggPSBvcmlnaW4uZ2V0X3goKTtcclxuICAgIHZhciBveSA9IG9yaWdpbi5nZXRfeSgpO1xyXG4gICAgdmFyIHggPSBwb2ludC5nZXRfeCgpO1xyXG4gICAgdmFyIHkgPSBwb2ludC5nZXRfeSgpO1xyXG5cclxuICAgIHJldHVybiBuZXcgYjJWZWMyKFxyXG4gICAgICAoY29zICogKHggLSBveCkpICsgKHNpbiAqICh5IC0gb3kpKSArIG94LFxyXG4gICAgICAoY29zICogKHkgLSBveSkpIC0gKHNpbiAqICh4IC0gb3gpKSArIG95XHJcbiAgICApO1xyXG4gIH0sXHJcblxyXG4gIGZpbmRBbmdsZTogZnVuY3Rpb24gKHBvaW50QSwgcG9pbnRCLCBjZW50ZXIpIHtcclxuICAgIHZhciB4QSA9IHBvaW50QS5nZXRfeCgpO1xyXG4gICAgdmFyIHhCID0gcG9pbnRCLmdldF94KCk7XHJcbiAgICB2YXIgeEMgPSBjZW50ZXIuZ2V0X3goKTtcclxuICAgIHZhciB5QSA9IHBvaW50QS5nZXRfeSgpO1xyXG4gICAgdmFyIHlCID0gcG9pbnRCLmdldF95KCk7XHJcbiAgICB2YXIgeUMgPSBjZW50ZXIuZ2V0X3koKTtcclxuXHJcbiAgICB2YXIgQUMgPSBNYXRoLnNxcnQoTWF0aC5wb3coeEMgLSB4QSwgMikgKyBNYXRoLnBvdyh5QyAtIHlBLCAyKSk7XHJcbiAgICB2YXIgQ0IgPSBNYXRoLnNxcnQoTWF0aC5wb3coeEMgLSB4QiwgMikgKyBNYXRoLnBvdyh5QyAtIHlCLCAyKSk7XHJcbiAgICB2YXIgQUIgPSBNYXRoLnNxcnQoTWF0aC5wb3coeEIgLSB4QSwgMikgKyBNYXRoLnBvdyh5QiAtIHlBLCAyKSk7XHJcblxyXG4gICAgcmV0dXJuIE1hdGguYWNvcygoQ0IgKiBDQiArIEFDICogQUMgLSBBQiAqIEFCKSAvICgyICogQ0IgKiBBQykpO1xyXG4gIH1cclxuXHJcbn07IiwiLy8gSU5QVVQgQ0FQVFVSSU5HXHJcblxyXG52YXIgSW5wdXQgPSBmdW5jdGlvbih2aWV3cG9ydCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICB0aGlzLnZpZXdwb3J0ID0gdmlld3BvcnQ7XHJcblxyXG4gIHRoaXMubW91c2UgPSB7XHJcbiAgICB4OiAwLFxyXG4gICAgeTogMCxcclxuICAgIGNhbnZhc1g6IDAsXHJcbiAgICBjYW52YXNZOiAwLFxyXG4gICAgcmVhbFg6IDAsXHJcbiAgICByZWFsWTogMCxcclxuICAgIGxlZnREb3duOiBmYWxzZSxcclxuICAgIHJpZ2h0RG93bjogZmFsc2UsXHJcbiAgICBsZWZ0VXA6IGZhbHNlLFxyXG4gICAgcmlnaHRVcDogZmFsc2UsXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5rZXlib2FyZCA9IHtcclxuICAgIGRvd246IG5ldyBTZXQoKSxcclxuICAgIHVwOiBuZXcgU2V0KCksXHJcblxyXG4gICAgaXNEb3duOiBmdW5jdGlvbiAoa2V5Q29kZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5kb3duLmhhcyhrZXlDb2RlKTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNVcDogZnVuY3Rpb24gKGtleUNvZGUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudXAuaGFzKGtleUNvZGUpO1xyXG4gICAgfSxcclxuICB9O1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLnVwZGF0ZU1vdXNlUG9zaXRpb24uYmluZCh0aGlzKSk7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy51cGRhdGVNb3VzZUJ1dHRvbnNEb3duLmJpbmQodGhpcykpO1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLnVwZGF0ZU1vdXNlQnV0dG9uc1VwLmJpbmQodGhpcykpO1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnVwZGF0ZUtleWJvYXJkQnV0dG9uc0Rvd24uYmluZCh0aGlzKSk7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLnVwZGF0ZUtleWJvYXJkQnV0dG9uc1VwLmJpbmQodGhpcykpO1xyXG5cclxuICBkb2N1bWVudC5vbnNlbGVjdHN0YXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH07XHJcbn07XHJcblxyXG5JbnB1dC5wcm90b3R5cGUuY2xlYW5VcCA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLm1vdXNlLmxlZnRVcCA9IGZhbHNlO1xyXG4gIHRoaXMubW91c2UucmlnaHRVcCA9IGZhbHNlO1xyXG5cclxuICB0aGlzLmtleWJvYXJkLnVwLmNsZWFyKCk7XHJcbn07XHJcblxyXG5JbnB1dC5wcm90b3R5cGUudXBkYXRlTW91c2VQb3NpdGlvbiA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gIHRoaXMubW91c2UuY2FudmFzWCA9IGV2ZW50LnBhZ2VYIC0gdGhpcy52aWV3cG9ydC5jYW52YXNFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgdGhpcy5tb3VzZS5jYW52YXNZID0gZXZlbnQucGFnZVkgLSB0aGlzLnZpZXdwb3J0LmNhbnZhc0VsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gIHRoaXMubW91c2UueCA9IHRoaXMudmlld3BvcnQudG9TY2FsZSh0aGlzLm1vdXNlLmNhbnZhc1gpICsgdGhpcy52aWV3cG9ydC54IC0gdGhpcy52aWV3cG9ydC50b1NjYWxlKHRoaXMudmlld3BvcnQud2lkdGgpIC8gMjtcclxuICB0aGlzLm1vdXNlLnkgPSB0aGlzLnZpZXdwb3J0LnRvU2NhbGUodGhpcy5tb3VzZS5jYW52YXNZKSArIHRoaXMudmlld3BvcnQueSAtIHRoaXMudmlld3BvcnQudG9TY2FsZSh0aGlzLnZpZXdwb3J0LmhlaWdodCkgLyAyO1xyXG4gIHRoaXMubW91c2UucmVhbFggPSBldmVudC5wYWdlWDtcclxuICB0aGlzLm1vdXNlLnJlYWxZID0gZXZlbnQucGFnZVk7XHJcbn07XHJcblxyXG5JbnB1dC5wcm90b3R5cGUudXBkYXRlTW91c2VCdXR0b25zRG93biA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gIGlmIChldmVudC53aGljaCA9PT0gMSlcclxuICAgIHRoaXMubW91c2UubGVmdERvd24gPSB0cnVlO1xyXG5cclxuICBpZiAoZXZlbnQud2hpY2ggPT09IDMpXHJcbiAgICB0aGlzLm1vdXNlLnJpZ2h0RG93biA9IHRydWU7XHJcbn07XHJcblxyXG5JbnB1dC5wcm90b3R5cGUudXBkYXRlTW91c2VCdXR0b25zVXAgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICBpZiAoZXZlbnQud2hpY2ggPT09IDEpIHtcclxuICAgIHRoaXMubW91c2UubGVmdERvd24gPSBmYWxzZTtcclxuICAgIHRoaXMubW91c2UubGVmdFVwID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGlmIChldmVudC53aGljaCA9PT0gMykge1xyXG4gICAgdGhpcy5tb3VzZS5yaWdodERvd24gPSBmYWxzZTtcclxuICAgIHRoaXMubW91c2UucmlnaHRVcCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuSW5wdXQucHJvdG90eXBlLnVwZGF0ZUtleWJvYXJkQnV0dG9uc0Rvd24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICB0aGlzLmtleWJvYXJkLmRvd24uYWRkKGV2ZW50LndoaWNoKTtcclxuXHJcbiAgaWYoZXZlbnQud2hpY2ggPT09IDMyKVxyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxufTtcclxuXHJcbklucHV0LnByb3RvdHlwZS51cGRhdGVLZXlib2FyZEJ1dHRvbnNVcCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gIHRoaXMua2V5Ym9hcmQuZG93bi5kZWxldGUoZXZlbnQud2hpY2gpO1xyXG4gIHRoaXMua2V5Ym9hcmQudXAuYWRkKGV2ZW50LndoaWNoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW5wdXQ7IiwidmFyIExvZ2ljID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuTG9naWM7XG52YXIgVHJhbnNsYXRpb25zID0gcmVxdWlyZShcIi4vdHJhbnNsYXRpb25zLmpzXCIpO1xudmFyIExpdGVyYWwgPSByZXF1aXJlKFwiLi90b2tlbi5qc1wiKS5MaXRlcmFsO1xudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcbnZhciBGaXhUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLkZpeFR5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gW107XG5cbnZhciBsQW5kID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIkFORFwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuQk9PTEVBTiwgVHlwZS5CT09MRUFOXSk7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG59O1xubEFuZC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubEFuZC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgJiYgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xufTtcblxubEFuZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQW5kO1xubW9kdWxlLmV4cG9ydHMucHVzaChsQW5kKTtcblxuXG52YXIgbE9yID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIk9SXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOLCBUeXBlLkJPT0xFQU5dKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcbn07XG5sT3IucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxPci5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSB8fCB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSlcbiAgICByZXR1cm4gdHJ1ZTtcblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5sT3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE9yO1xubW9kdWxlLmV4cG9ydHMucHVzaChsT3IpO1xuXG5cbnZhciBsTm90ID0gZnVuY3Rpb24gKGEpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIk5PVFwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuQk9PTEVBTl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xufTtcbmxOb3QucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxOb3QucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gIXRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xufTtcblxubE5vdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTm90O1xubW9kdWxlLmV4cG9ydHMucHVzaChsTm90KTtcblxuXG52YXIgbFN0cmluZyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwidGV4dFwiLCBUeXBlLlNUUklORywgYXJndW1lbnRzLCBbVHlwZS5MSVRFUkFMXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2godmFsdWUpO1xufTtcbmxTdHJpbmcucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxTdHJpbmcucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCk7XG59O1xuXG5sU3RyaW5nLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5sU3RyaW5nLnByb3RvdHlwZS5wb3B1bGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5hcmdzWzBdID0gbmV3IExpdGVyYWwocHJvbXB0KFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkKFwiQkVIQVZJT1JTLklOUFVUX0RJQUxPR1wiKSArIHRoaXMubmFtZSkpO1xufTtcblxubFN0cmluZy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsU3RyaW5nO1xubW9kdWxlLmV4cG9ydHMucHVzaChsU3RyaW5nKTtcblxuXG52YXIgbE51bWJlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwibnVtYmVyXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkxJVEVSQUxdKTtcblxuICB0aGlzLmFyZ3MucHVzaCh2YWx1ZSk7XG59O1xubE51bWJlci5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubE51bWJlci5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBwYXJzZUZsb2F0KHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpKTtcbn07XG5cbmxOdW1iZXIucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gJC5pc051bWVyaWModGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkpO1xufTtcblxubE51bWJlci5wcm90b3R5cGUucG9wdWxhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuYXJnc1swXSA9IG5ldyBMaXRlcmFsKHByb21wdChUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZChCRUhBVklPUlMuSU5QVVRfRElBTE9HKSArIHRoaXMubmFtZSkpO1xufTtcblxubE51bWJlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTnVtYmVyO1xubW9kdWxlLmV4cG9ydHMucHVzaChsTnVtYmVyKTtcblxuXG52YXIgbFRydWUgPSBmdW5jdGlvbiAoKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJ0cnVlXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbXSk7XG59O1xubFRydWUucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxUcnVlLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5sVHJ1ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsVHJ1ZTtcbm1vZHVsZS5leHBvcnRzLnB1c2gobFRydWUpO1xuXG5cbnZhciBsRmFsc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImZhbHNlXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbXSk7XG59O1xubEZhbHNlLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sRmFsc2UucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZmFsc2U7XG59O1xuXG5sRmFsc2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbEZhbHNlO1xubW9kdWxlLmV4cG9ydHMucHVzaChsRmFsc2UpO1xuXG5cbnZhciBsQnV0dG9uRG93biA9IGZ1bmN0aW9uIChidXR0b24pIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImlzQnV0dG9uRG93blwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYnV0dG9uKTtcbn07XG5sQnV0dG9uRG93bi5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubEJ1dHRvbkRvd24ucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gX2VuZ2luZS5pbnB1dC5rZXlib2FyZC5pc0Rvd24odGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkpO1xufTtcblxubEJ1dHRvbkRvd24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbEJ1dHRvbkRvd247XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxCdXR0b25Eb3duKTtcblxuXG52YXIgbEJ1dHRvblVwID0gZnVuY3Rpb24gKGJ1dHRvbikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiaXNCdXR0b25VcFwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYnV0dG9uKTtcbn07XG5sQnV0dG9uVXAucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxCdXR0b25VcC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBfZW5naW5lLmlucHV0LmtleWJvYXJkLmlzVXAodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkpO1xufTtcblxubEJ1dHRvblVwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxCdXR0b25VcDtcbm1vZHVsZS5leHBvcnRzLnB1c2gobEJ1dHRvblVwKTtcblxuXG52YXIgbFJhbmRvbSA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwicmFuZG9tTnVtYmVyXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChtaW4pO1xuICB0aGlzLmFyZ3MucHVzaChtYXgpO1xufTtcbmxSYW5kb20ucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxSYW5kb20ucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gVXRpbHMucmFuZG9tUmFuZ2UodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgJiYgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xufTtcblxubFJhbmRvbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsUmFuZG9tO1xubW9kdWxlLmV4cG9ydHMucHVzaChsUmFuZG9tKTtcblxuXG52YXIgbFZlbG9jaXR5WCA9IGZ1bmN0aW9uIChlZikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiZ2V0VmVsb2NpdHlYXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcbn07XG5sVmVsb2NpdHlYLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sVmVsb2NpdHlYLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVudGl0eSA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKVswXTtcblxuICByZXR1cm4gZW50aXR5LmJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKS5nZXRfeCgpO1xufTtcblxubFZlbG9jaXR5WC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsVmVsb2NpdHlYO1xubW9kdWxlLmV4cG9ydHMucHVzaChsVmVsb2NpdHlYKTtcblxuXG52YXIgbFZlbG9jaXR5WSA9IGZ1bmN0aW9uIChlZikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiZ2V0VmVsb2NpdHlZXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcbn07XG5sVmVsb2NpdHlZLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sVmVsb2NpdHlZLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVudGl0eSA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKVswXTtcblxuICByZXR1cm4gZW50aXR5LmJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKS5nZXRfeSgpO1xufTtcblxubFZlbG9jaXR5WS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsVmVsb2NpdHlZO1xubW9kdWxlLmV4cG9ydHMucHVzaChsVmVsb2NpdHlZKTtcblxuXG52YXIgbFBsdXMgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiK1wiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59O1xubFBsdXMucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxQbHVzLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICsgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59O1xuXG5sUGx1cy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsUGx1cztcbm1vZHVsZS5leHBvcnRzLnB1c2gobFBsdXMpO1xuXG5cbnZhciBsTXVsdGlwbHkgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiKlwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59O1xubE11bHRpcGx5LnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sTXVsdGlwbHkucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKTtcbn07XG5cbmxNdWx0aXBseS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTXVsdGlwbHk7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxNdWx0aXBseSk7XG5cblxudmFyIGxEaXZpZGUgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiL1wiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59O1xubERpdmlkZS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubERpdmlkZS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSAvIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpO1xufTtcblxubERpdmlkZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsRGl2aWRlO1xubW9kdWxlLmV4cG9ydHMucHVzaChsRGl2aWRlKTtcblxuXG52YXIgbE1pbnVzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIi1cIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xufTtcbmxNaW51cy5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubE1pbnVzLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICsgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59O1xuXG5sTWludXMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE1pbnVzO1xubW9kdWxlLmV4cG9ydHMucHVzaChsTWludXMpO1xuXG5cbnZhciBsR3JlYXRlciA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCI+XCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59O1xubEdyZWF0ZXIucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxHcmVhdGVyLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpID4gdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59O1xuXG5sR3JlYXRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsR3JlYXRlcjtcbm1vZHVsZS5leHBvcnRzLnB1c2gobEdyZWF0ZXIpO1xuXG5cbnZhciBsTGVzc2VyID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIjxcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcbn07XG5sTGVzc2VyLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sTGVzc2VyLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpIDwgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59O1xuXG5sTGVzc2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxMZXNzZXI7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxMZXNzZXIpO1xuXG5cbiIsInZhciBGaXhUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nXCIpLkZpeFR5cGU7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nXCIpLlR5cGU7XHJcbnZhciBMaXRlcmFsID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuTGl0ZXJhbDtcclxuXHJcblxyXG52YXIgUGFyc2VyID0gZnVuY3Rpb24gKHRva2VuTWFuYWdlcikge1xyXG4gIHRoaXMudG9rZW5NYW5hZ2VyID0gdG9rZW5NYW5hZ2VyO1xyXG5cclxuICB0aGlzLnBhcnNlcklucHV0ID0gXCJcIjtcclxuICB0aGlzLnBhcnNlcklucHV0V2hvbGUgPSBcIlwiO1xyXG4gIHRoaXMucGFyc2VyU3RhY2sgPSBbXTtcclxufTtcclxuXHJcblBhcnNlci5wcm90b3R5cGUuZmFpbCA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgdGhyb3cgbWVzc2FnZSArIFwiXFxuUmVtYWluaW5nIGlucHV0OiBcIiArIHRoaXMucGFyc2VySW5wdXQ7XHJcbn07XHJcblxyXG5QYXJzZXIucHJvdG90eXBlLmN1cnJlbnRDaGFyID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMucGFyc2VySW5wdXQubGVuZ3RoID8gdGhpcy5wYXJzZXJJbnB1dFswXSA6IFwiXCI7XHJcbn07XHJcblxyXG5QYXJzZXIucHJvdG90eXBlLm5leHRDaGFyID0gZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiB0aGlzLnBhcnNlcklucHV0WzFdO1xyXG59O1xyXG5cclxuUGFyc2VyLnByb3RvdHlwZS5yZW1vdmVDaGFyID0gZnVuY3Rpb24gKCkge1xyXG4gIHRoaXMucGFyc2VySW5wdXQgPSB0aGlzLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG59O1xyXG5cclxuUGFyc2VyLnByb3RvdHlwZS5yZWFkQ2hhciA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciByZXQgPSB0aGlzLmN1cnJlbnRDaGFyKCk7XHJcblxyXG4gIHRoaXMucmVtb3ZlQ2hhcigpO1xyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuUGFyc2VyLnByb3RvdHlwZS5yZWFkV2hpdGVzcGFjZSA9IGZ1bmN0aW9uICgpIHtcclxuICB3aGlsZSAodGhpcy5jdXJyZW50Q2hhcigpID09PSBcIiBcIilcclxuICAgIHRoaXMucmVtb3ZlQ2hhcigpO1xyXG59O1xyXG5cclxuUGFyc2VyLnByb3RvdHlwZS5yZWFkTmFtZSA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gIHZhciByZXQgPSBcIlwiO1xyXG5cclxuICB3aGlsZSgvW14gLCkoXCJdLy50ZXN0KHRoaXMuY3VycmVudENoYXIoKSkpXHJcbiAgICByZXQgKz0gdGhpcy5yZWFkQ2hhcigpO1xyXG5cclxuICBpZiAodGhpcy5jdXJyZW50Q2hhcigpID09PSAnXCInKSB7XHJcbiAgICB0aGlzLnJlYWRDaGFyKCk7XHJcblxyXG4gICAgd2hpbGUgKHRoaXMuY3VycmVudENoYXIoKSAhPT0gJ1wiJykge1xyXG4gICAgICBpZiAodGhpcy5jdXJyZW50Q2hhcigpID09PSBcIlxcXFxcIiAmJiB0aGlzLm5leHRDaGFyKCkgPT09IFwiXFxcIlwiKSB7XHJcbiAgICAgICAgdGhpcy5yZWFkQ2hhcigpO1xyXG4gICAgICAgIHRoaXMucmVhZENoYXIoKTtcclxuXHJcbiAgICAgICAgcmV0ICs9IFwiXFxcIlwiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcmV0ICs9IHRoaXMucmVhZENoYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlYWRDaGFyKCk7XHJcbiAgfVxyXG5cclxuICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5QYXJzZXIucHJvdG90eXBlLnJlYWRQYXJlbnRoZXNlcyA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gIGlmICh0aGlzLmN1cnJlbnRDaGFyKCkgIT09IFwiKFwiKVxyXG4gICAgcmV0dXJuO1xyXG5cclxuICB0aGlzLnJlYWRDaGFyKCk7XHJcblxyXG4gIHdoaWxlICh0aGlzLmN1cnJlbnRDaGFyKCkgIT09IFwiKVwiKXtcclxuICAgIHRoaXMucmVhZFdoaXRlc3BhY2UoKTtcclxuXHJcbiAgICB0aGlzLnBhcnNlVG9rZW4oKTtcclxuXHJcbiAgICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuY3VycmVudENoYXIoKSA9PT0gXCIsXCIpIHtcclxuICAgICAgdGhpcy5yZWFkQ2hhcigpO1xyXG4gICAgICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB0aGlzLnJlYWRDaGFyKCk7XHJcbn07XHJcblxyXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlVG9rZW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgdGhpcy5yZWFkUGFyZW50aGVzZXMoKTtcclxuXHJcbiAgdmFyIG5hbWUgPSB0aGlzLnJlYWROYW1lKCk7XHJcbiAgdmFyIHRva2VuID0gdGhpcy50b2tlbk1hbmFnZXIuZ2V0VG9rZW5CeU5hbWUobmFtZSk7XHJcbiAgdG9rZW4gPSB0b2tlbiA9PT0gdW5kZWZpbmVkID8gbmV3IExpdGVyYWwobmFtZSkgOiBuZXcgdG9rZW4uY29uc3RydWN0b3IoKTtcclxuXHJcbiAgdGhpcy5yZWFkUGFyZW50aGVzZXMoKTtcclxuXHJcbiAgaWYgKHRva2VuLnR5cGUgIT09IFR5cGUuTElURVJBTClcclxuICB7XHJcbiAgICBmb3IodmFyIGkgPSB0b2tlbi5hcmd1bWVudF90eXBlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICB2YXIgYXJnID0gdGhpcy5wYXJzZXJTdGFjay5wb3AoKTtcclxuXHJcbiAgICAgIGlmICgodG9rZW4uYXJndW1lbnRfdHlwZXNbaV0gIT09IGFyZy50eXBlKSlcclxuICAgICAgICB0aGlzLmZhaWwoXCJFeHBlY3RlZCBcIiArIHRva2VuLmFyZ3VtZW50X3R5cGVzW2ldICsgXCIsIGdvdCBcIiArIGFyZy50eXBlKTtcclxuICAgICAgXHJcbiAgICAgIHRva2VuLmFyZ3NbaV0gPSBhcmc7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB0aGlzLnBhcnNlclN0YWNrLnB1c2godG9rZW4pO1xyXG5cclxuICByZXR1cm4gdG9rZW47XHJcbn07XHJcblxyXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKGlucHV0KSB7XHJcbiAgdGhpcy5wYXJzZXJJbnB1dCA9IGlucHV0O1xyXG4gIHRoaXMucGFyc2VySW5wdXRXaG9sZSA9IGlucHV0O1xyXG4gIHRoaXMucGFyc2VyU3RhY2sgPSBbXTtcclxuXHJcbiAgcmV0dXJuIHRoaXMucGFyc2VUb2tlbigpO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyOyIsInZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi9lbnRpdHkuanNcIik7XHJcbnZhciBDb25zdGFudHMgPSByZXF1aXJlKFwiLi9jb25zdGFudHMuanNcIik7XHJcbnZhciBDbGlja2FibGVIZWxwZXIgPSByZXF1aXJlKFwiLi9jbGlja2FibGVoZWxwZXIuanNcIik7XHJcbnZhciBHZW9tZXRyeSA9IHJlcXVpcmUoXCIuL2dlb21ldHJ5LmpzXCIpO1xyXG5cclxuLy8gQ2lyY2xlIGVudGl0eVxyXG52YXIgQ2lyY2xlID0gZnVuY3Rpb24gKGNlbnRlciwgcmFkaXVzLCBmaXh0dXJlLCBpZCwgY29sbGlzaW9uR3JvdXApIHtcclxuICB2YXIgc2hhcGUgPSBuZXcgYjJDaXJjbGVTaGFwZSgpO1xyXG4gIHNoYXBlLnNldF9tX3JhZGl1cyhyYWRpdXMpO1xyXG5cclxuICB2YXIgYm9keSA9IG5ldyBiMkJvZHlEZWYoKTtcclxuICBib2R5LnNldF9wb3NpdGlvbihjZW50ZXIpO1xyXG5cclxuICBFbnRpdHkuY2FsbCh0aGlzLCBzaGFwZSwgZml4dHVyZSwgYm9keSwgaWQsIGNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcblxyXG4gIHRoaXMubmFtZVN0cmluZyA9IFwiQ0lSQ0xFXCI7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5DaXJjbGUucHJvdG90eXBlID0gbmV3IEVudGl0eSgpO1xyXG5DaXJjbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2lyY2xlO1xyXG5cclxuQ2lyY2xlLnByb3RvdHlwZS5nZXRXaWR0aCA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gdGhpcy5yYWRpdXMgKiAyO1xyXG59O1xyXG5cclxuQ2lyY2xlLnByb3RvdHlwZS5nZXRIZWlnaHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHRoaXMucmFkaXVzICogMjtcclxufTtcclxuXHJcbkNpcmNsZS5wcm90b3R5cGUuYWRkSGVscGVycyA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLmhlbHBlcnMgPSBbXHJcbiAgICBuZXcgQ2xpY2thYmxlSGVscGVyKHRoaXMsIDE1LCAxNSwgQ29uc3RhbnRzLlBPU0lUSU9OX1RPUF9SSUdIVCwgJ2ltZy9yZXNpemUtc3ctbmUuc3ZnJywgdGhpcy5tb3ZlUmVzaXplLCB0aGlzLnN0YXJ0UmVzaXplKSxcclxuICBdO1xyXG59O1xyXG5cclxuQ2lyY2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKGN0eCkge1xyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuXHJcbiAgY3R4LmFyYygwLCAwLCBfZW5naW5lLnZpZXdwb3J0LmZyb21TY2FsZSh0aGlzLnJhZGl1cyksIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcblxyXG4gIGN0eC5maWxsKCk7XHJcblxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XHJcbiAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IFwiZGVzdGluYXRpb24tb3V0XCI7XHJcblxyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgubW92ZVRvKDAsIDApO1xyXG4gIGN0eC5saW5lVG8oMCwgX2VuZ2luZS52aWV3cG9ydC5mcm9tU2NhbGUodGhpcy5yYWRpdXMpKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbiAgY3R4LmNsb3NlUGF0aCgpO1xyXG59O1xyXG5cclxuQ2lyY2xlLnByb3RvdHlwZS5zdGFydFJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLnN0YXJ0U2l6ZSA9IHRoaXMuZW50aXR5LmdldFdpZHRoKCkgLyAyO1xyXG5cclxuICB0aGlzLnN0YXJ0RGlzdGFuY2UgPSBHZW9tZXRyeS5wb2ludFBvaW50RGlzdGFuY2UoXHJcbiAgICBuZXcgYjJWZWMyKHRoaXMuZW50aXR5LmdldFgoKSwgdGhpcy5lbnRpdHkuZ2V0WSgpKSxcclxuXHJcbiAgICBuZXcgYjJWZWMyKFxyXG4gICAgICBfZW5naW5lLmlucHV0Lm1vdXNlLngsXHJcbiAgICAgIF9lbmdpbmUuaW5wdXQubW91c2UueVxyXG4gICAgKVxyXG4gICk7XHJcbn07XHJcblxyXG5DaXJjbGUucHJvdG90eXBlLm1vdmVSZXNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIHNjYWxlID0gR2VvbWV0cnkucG9pbnRQb2ludERpc3RhbmNlKFxyXG4gICAgICBuZXcgYjJWZWMyKHRoaXMuZW50aXR5LmdldFgoKSwgdGhpcy5lbnRpdHkuZ2V0WSgpKSxcclxuXHJcbiAgICAgIG5ldyBiMlZlYzIoXHJcbiAgICAgICAgX2VuZ2luZS5pbnB1dC5tb3VzZS54LFxyXG4gICAgICAgIF9lbmdpbmUuaW5wdXQubW91c2UueVxyXG4gICAgICApXHJcbiAgICApIC8gdGhpcy5zdGFydERpc3RhbmNlO1xyXG5cclxuICB0aGlzLmVudGl0eS5yZXNpemUodGhpcy5zdGFydFNpemUgKiBzY2FsZSk7XHJcbn07XHJcblxyXG5DaXJjbGUucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uIChyYWRpdXMpIHtcclxuICBpZiAocmFkaXVzIDwgQ29uc3RhbnRzLlNIQVBFX01JTl9TSVpFIC8gMilcclxuICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgdmFyIG5ld0ZpeCA9IG5ldyBiMkZpeHR1cmVEZWYoKTtcclxuICBuZXdGaXguc2V0X2RlbnNpdHkodGhpcy5maXh0dXJlLkdldERlbnNpdHkoKSk7XHJcbiAgbmV3Rml4LnNldF9mcmljdGlvbih0aGlzLmZpeHR1cmUuR2V0RnJpY3Rpb24oKSk7XHJcbiAgbmV3Rml4LnNldF9yZXN0aXR1dGlvbih0aGlzLmZpeHR1cmUuR2V0UmVzdGl0dXRpb24oKSk7XHJcbiAgbmV3Rml4LnNldF9maWx0ZXIodGhpcy5maXh0dXJlLkdldEZpbHRlckRhdGEoKSk7XHJcblxyXG4gIHZhciBzaGFwZSA9IG5ldyBiMkNpcmNsZVNoYXBlKCk7XHJcbiAgc2hhcGUuc2V0X21fcmFkaXVzKHJhZGl1cyk7XHJcbiAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcblxyXG4gIG5ld0ZpeC5zZXRfc2hhcGUoc2hhcGUpO1xyXG5cclxuICB0aGlzLmJvZHkuRGVzdHJveUZpeHR1cmUodGhpcy5maXh0dXJlKTtcclxuICB0aGlzLmZpeHR1cmUgPSB0aGlzLmJvZHkuQ3JlYXRlRml4dHVyZShuZXdGaXgpO1xyXG5cclxuICB0aGlzLnJlY2FsY3VsYXRlSGVscGVycygpO1xyXG5cclxuICBpZiAodGhpcyA9PT0gX2VuZ2luZS5zZWxlY3RlZEVudGl0eSkge1xyXG4gICAgJChcIiNlbnRpdHlfd2lkdGhcIikudmFsKHJhZGl1cyAqIDIpO1xyXG4gICAgJChcIiNlbnRpdHlfaGVpZ2h0XCIpLnZhbChyYWRpdXMgKiAyKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuXHJcbi8vIFJlY3RhbmdsZSBlbnRpdHlcclxudmFyIFJlY3RhbmdsZSA9IGZ1bmN0aW9uIChjZW50ZXIsIGV4dGVudHMsIGZpeHR1cmUsIGlkLCBjb2xsaXNpb25Hcm91cCkge1xyXG4gIHZhciBzaGFwZSA9IG5ldyBiMlBvbHlnb25TaGFwZSgpO1xyXG4gIHNoYXBlLlNldEFzQm94KGV4dGVudHMuZ2V0X3goKSwgZXh0ZW50cy5nZXRfeSgpKTtcclxuXHJcbiAgdmFyIGJvZHkgPSBuZXcgYjJCb2R5RGVmKCk7XHJcbiAgYm9keS5zZXRfcG9zaXRpb24oY2VudGVyKTtcclxuXHJcbiAgRW50aXR5LmNhbGwodGhpcywgc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIHRoaXMuZXh0ZW50cyA9IGV4dGVudHM7XHJcblxyXG4gIHRoaXMubmFtZVN0cmluZyA9IFwiUkVDVEFOR0xFXCI7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5SZWN0YW5nbGUucHJvdG90eXBlID0gbmV3IEVudGl0eSgpO1xyXG5SZWN0YW5nbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVjdGFuZ2xlO1xyXG5cclxuUmVjdGFuZ2xlLnByb3RvdHlwZS5nZXRXaWR0aCA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gdGhpcy5leHRlbnRzLmdldF94KCkgKiAyO1xyXG59O1xyXG5cclxuUmVjdGFuZ2xlLnByb3RvdHlwZS5nZXRIZWlnaHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHRoaXMuZXh0ZW50cy5nZXRfeSgpICogMjtcclxufTtcclxuXHJcblJlY3RhbmdsZS5wcm90b3R5cGUuYWRkSGVscGVycyA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLmhlbHBlcnMgPSBbXHJcbiAgICBuZXcgQ2xpY2thYmxlSGVscGVyKHRoaXMsIDE1LCAxNSwgQ29uc3RhbnRzLlBPU0lUSU9OX1RPUF9SSUdIVCwgJ2ltZy9yZXNpemUtc3ctbmUuc3ZnJywgdGhpcy5tb3ZlUmVzaXplLCB0aGlzLnN0YXJ0UmVzaXplKSxcclxuICAgIG5ldyBDbGlja2FibGVIZWxwZXIodGhpcywgNywgNywgQ29uc3RhbnRzLlBPU0lUSU9OX0JPVFRPTSwgJ2ltZy9oYW5kbGUuc3ZnJywgdGhpcy5tb3ZlUmVzaXplU2lkZSwgdGhpcy5zdGFydFJlc2l6ZVNpZGUpLFxyXG4gICAgbmV3IENsaWNrYWJsZUhlbHBlcih0aGlzLCA3LCA3LCBDb25zdGFudHMuUE9TSVRJT05fVE9QLCAnaW1nL2hhbmRsZS5zdmcnLCB0aGlzLm1vdmVSZXNpemVTaWRlLCB0aGlzLnN0YXJ0UmVzaXplU2lkZSksXHJcbiAgICBuZXcgQ2xpY2thYmxlSGVscGVyKHRoaXMsIDcsIDcsIENvbnN0YW50cy5QT1NJVElPTl9MRUZULCAnaW1nL2hhbmRsZS5zdmcnLCB0aGlzLm1vdmVSZXNpemVTaWRlLCB0aGlzLnN0YXJ0UmVzaXplU2lkZSksXHJcbiAgICBuZXcgQ2xpY2thYmxlSGVscGVyKHRoaXMsIDcsIDcsIENvbnN0YW50cy5QT1NJVElPTl9SSUdIVCwgJ2ltZy9oYW5kbGUuc3ZnJywgdGhpcy5tb3ZlUmVzaXplU2lkZSwgdGhpcy5zdGFydFJlc2l6ZVNpZGUpLFxyXG4gIF07XHJcbn07XHJcblxyXG5SZWN0YW5nbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgdmFyIGhhbGZXaWR0aCA9IF9lbmdpbmUudmlld3BvcnQuZnJvbVNjYWxlKHRoaXMuZXh0ZW50cy5nZXRfeCgpKTtcclxuICB2YXIgaGFsZkhlaWdodCA9IF9lbmdpbmUudmlld3BvcnQuZnJvbVNjYWxlKHRoaXMuZXh0ZW50cy5nZXRfeSgpKTtcclxuXHJcbiAgY3R4LmZpbGxSZWN0KC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0LCBoYWxmV2lkdGggKiAyLCBoYWxmSGVpZ2h0ICogMik7XHJcbn07XHJcblxyXG5SZWN0YW5nbGUucHJvdG90eXBlLnN0YXJ0UmVzaXplU2lkZSA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLnN0YXJ0U2l6ZSA9IFtcclxuICAgIHRoaXMuZW50aXR5LmdldFdpZHRoKCkgLyAyLFxyXG4gICAgdGhpcy5lbnRpdHkuZ2V0SGVpZ2h0KCkgLyAyXHJcbiAgXTtcclxuXHJcbiAgdGhpcy5zdGFydFBvc2l0aW9uID0gbmV3IGIyVmVjMihcclxuICAgIHRoaXMuZW50aXR5LmdldFgoKSxcclxuICAgIHRoaXMuZW50aXR5LmdldFkoKVxyXG4gICk7XHJcbn07XHJcblxyXG5SZWN0YW5nbGUucHJvdG90eXBlLm1vdmVSZXNpemVTaWRlID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBtb3VzZVJvdGF0ZWQgPSBHZW9tZXRyeS5wb2ludFJvdGF0ZShcclxuICAgIHRoaXMuc3RhcnRQb3NpdGlvbixcclxuICAgIG5ldyBiMlZlYzIoX2VuZ2luZS5pbnB1dC5tb3VzZS54LCBfZW5naW5lLmlucHV0Lm1vdXNlLnkpLFxyXG4gICAgLSh0aGlzLmVudGl0eS5ib2R5LkdldEFuZ2xlKCkgKyBDb25zdGFudHMuc2lkZU9yZGVyLmVxdWFsSW5kZXhPZih0aGlzLnBvc2l0aW9uKSAqIChNYXRoLlBJIC8gMikpXHJcbiAgKTtcclxuXHJcbiAgdmFyIGRpc3RhbmNlID0gdGhpcy5zdGFydFBvc2l0aW9uLmdldF95KCkgLSBtb3VzZVJvdGF0ZWQuZ2V0X3koKTtcclxuXHJcbiAgaWYgKHRoaXMuZW50aXR5LnJlc2l6ZShcclxuICAgICAgKHRoaXMuc3RhcnRTaXplWzBdICsgdGhpcy5zdGFydFNpemVbMF0gKiBNYXRoLmFicyh0aGlzLnBvc2l0aW9uWzFdKSArIGRpc3RhbmNlICogTWF0aC5hYnModGhpcy5wb3NpdGlvblswXSkpIC8gMixcclxuICAgICAgKHRoaXMuc3RhcnRTaXplWzFdICsgdGhpcy5zdGFydFNpemVbMV0gKiBNYXRoLmFicyh0aGlzLnBvc2l0aW9uWzBdKSArIGRpc3RhbmNlICogTWF0aC5hYnModGhpcy5wb3NpdGlvblsxXSkpIC8gMlxyXG4gICAgKSkge1xyXG5cclxuICAgIHRoaXMuZW50aXR5LmJvZHkuU2V0VHJhbnNmb3JtKFxyXG4gICAgICBHZW9tZXRyeS5wb2ludFJvdGF0ZShcclxuICAgICAgICB0aGlzLnN0YXJ0UG9zaXRpb24sXHJcbiAgICAgICAgbmV3IGIyVmVjMihcclxuICAgICAgICAgIHRoaXMuc3RhcnRQb3NpdGlvbi5nZXRfeCgpICsgKChkaXN0YW5jZSAtIHRoaXMuc3RhcnRTaXplWzBdKSAvIDIpICogdGhpcy5wb3NpdGlvblswXSxcclxuICAgICAgICAgIHRoaXMuc3RhcnRQb3NpdGlvbi5nZXRfeSgpICsgKChkaXN0YW5jZSAtIHRoaXMuc3RhcnRTaXplWzFdKSAvIDIpICogdGhpcy5wb3NpdGlvblsxXVxyXG4gICAgICAgICksXHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYm9keS5HZXRBbmdsZSgpXHJcbiAgICAgICksXHJcblxyXG4gICAgICB0aGlzLmVudGl0eS5ib2R5LkdldEFuZ2xlKClcclxuICAgICk7XHJcblxyXG4gIH1cclxufTtcclxuXHJcblJlY3RhbmdsZS5wcm90b3R5cGUuc3RhcnRSZXNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdGhpcy5zdGFydFNpemUgPSBbXHJcbiAgICB0aGlzLmVudGl0eS5nZXRXaWR0aCgpIC8gMixcclxuICAgIHRoaXMuZW50aXR5LmdldEhlaWdodCgpIC8gMlxyXG4gIF07XHJcblxyXG4gIHRoaXMuc3RhcnREaXN0YW5jZSA9IEdlb21ldHJ5LnBvaW50UG9pbnREaXN0YW5jZShcclxuICAgIHRoaXMuZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKSxcclxuXHJcbiAgICBuZXcgYjJWZWMyKFxyXG4gICAgICBfZW5naW5lLmlucHV0Lm1vdXNlLngsXHJcbiAgICAgIF9lbmdpbmUuaW5wdXQubW91c2UueVxyXG4gICAgKVxyXG4gICk7XHJcbn07XHJcblxyXG5SZWN0YW5nbGUucHJvdG90eXBlLm1vdmVSZXNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIHNjYWxlID0gR2VvbWV0cnkucG9pbnRQb2ludERpc3RhbmNlKFxyXG4gICAgICB0aGlzLmVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCksXHJcblxyXG4gICAgICBuZXcgYjJWZWMyKFxyXG4gICAgICAgIF9lbmdpbmUuaW5wdXQubW91c2UueCxcclxuICAgICAgICBfZW5naW5lLmlucHV0Lm1vdXNlLnlcclxuICAgICAgKVxyXG4gICAgKSAvIHRoaXMuc3RhcnREaXN0YW5jZTtcclxuXHJcbiAgdGhpcy5lbnRpdHkucmVzaXplKHRoaXMuc3RhcnRTaXplWzBdICogc2NhbGUsIHRoaXMuc3RhcnRTaXplWzFdICogc2NhbGUpO1xyXG59O1xyXG5cclxuUmVjdGFuZ2xlLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAoaGFsZldpZHRoLCBoYWxmSGVpZ2h0KSB7XHJcbiAgaWYgKFxyXG4gICAgaGFsZldpZHRoICogMiA8IENvbnN0YW50cy5TSEFQRV9NSU5fU0laRSB8fFxyXG4gICAgaGFsZkhlaWdodCAqIDIgPCBDb25zdGFudHMuU0hBUEVfTUlOX1NJWkVcclxuICApXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gIHZhciBuZXdGaXggPSBuZXcgYjJGaXh0dXJlRGVmKCk7XHJcbiAgbmV3Rml4LnNldF9kZW5zaXR5KHRoaXMuZml4dHVyZS5HZXREZW5zaXR5KCkpO1xyXG4gIG5ld0ZpeC5zZXRfZnJpY3Rpb24odGhpcy5maXh0dXJlLkdldEZyaWN0aW9uKCkpO1xyXG4gIG5ld0ZpeC5zZXRfcmVzdGl0dXRpb24odGhpcy5maXh0dXJlLkdldFJlc3RpdHV0aW9uKCkpO1xyXG4gIG5ld0ZpeC5zZXRfZmlsdGVyKHRoaXMuZml4dHVyZS5HZXRGaWx0ZXJEYXRhKCkpO1xyXG5cclxuICB2YXIgc2hhcGUgPSBuZXcgYjJQb2x5Z29uU2hhcGUoKTtcclxuICBzaGFwZS5TZXRBc0JveChoYWxmV2lkdGgsIGhhbGZIZWlnaHQpO1xyXG4gIHRoaXMuZXh0ZW50cyA9IG5ldyBiMlZlYzIoaGFsZldpZHRoLCBoYWxmSGVpZ2h0KTtcclxuXHJcbiAgbmV3Rml4LnNldF9zaGFwZShzaGFwZSk7XHJcblxyXG4gIHRoaXMuYm9keS5EZXN0cm95Rml4dHVyZSh0aGlzLmZpeHR1cmUpO1xyXG4gIHRoaXMuZml4dHVyZSA9IHRoaXMuYm9keS5DcmVhdGVGaXh0dXJlKG5ld0ZpeCk7XHJcblxyXG4gIHRoaXMucmVjYWxjdWxhdGVIZWxwZXJzKCk7XHJcblxyXG4gIGlmICh0aGlzID09PSBfZW5naW5lLnNlbGVjdGVkRW50aXR5KSB7XHJcbiAgICAkKFwiI2VudGl0eV93aWR0aFwiKS52YWwoaGFsZldpZHRoICogMik7XHJcbiAgICAkKFwiI2VudGl0eV9oZWlnaHRcIikudmFsKGhhbGZIZWlnaHQgKiAyKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzLkNpcmNsZSA9IENpcmNsZTtcclxubW9kdWxlLmV4cG9ydHMuUmVjdGFuZ2xlID0gUmVjdGFuZ2xlOyIsInZhciBGaXhUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLkZpeFR5cGU7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XHJcblxyXG52YXIgVG9rZW4gPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBhcmdzLCBhcmd1bWVudF90eXBlcykge1xyXG4gIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5QUkVGSVg7XHJcbiAgdGhpcy5uYW1lID0gbmFtZTtcclxuICB0aGlzLmFyZ3MgPSBhcmdzID09IHVuZGVmaW5lZCA/IFtdIDogYXJncztcclxuICB0aGlzLmFyZ3VtZW50X3R5cGVzID0gYXJndW1lbnRfdHlwZXM7XHJcbiAgdGhpcy5hcmdzID0gW107XHJcbn07XHJcblxyXG5Ub2tlbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgcmV0ID0gXCJcIjtcclxuICB2YXIgYXJnU3RyaW5ncyA9IFtdO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgYXJnU3RyaW5ncy5wdXNoKHRoaXMuYXJnc1tpXS50b1N0cmluZygpKTtcclxuICB9XHJcblxyXG4gIGFyZ1N0cmluZ3MgPSBhcmdTdHJpbmdzLmpvaW4oXCIsIFwiKTtcclxuXHJcbiAgc3dpdGNoICh0aGlzLmZpeFR5cGUpIHtcclxuICAgIGNhc2UgRml4VHlwZS5QUkVGSVg6XHJcbiAgICAgIHJldCA9IHRoaXMubmFtZSArIFwiKFwiICsgYXJnU3RyaW5ncyArIFwiKVwiO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgRml4VHlwZS5JTkZJWDpcclxuICAgICAgcmV0ID0gXCIoXCIgKyB0aGlzLmFyZ3NbMF0udG9TdHJpbmcoKSArIFwiKVwiICsgdGhpcy5uYW1lICsgXCIoXCIgKyB0aGlzLmFyZ3NbMV0udG9TdHJpbmcoKSArIFwiKVwiO1xyXG4gICAgICBicmVhaztcclxuICB9XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5cclxudmFyIExpdGVyYWwgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gIHRoaXMudHlwZSA9IFR5cGUuTElURVJBTDtcclxuICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbn07XHJcblxyXG5MaXRlcmFsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gJ1wiJyArIHRoaXMudmFsdWUgKyAnXCInO1xyXG59O1xyXG5cclxuTGl0ZXJhbC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbn07XHJcblxyXG5cclxudmFyIExvZ2ljID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICBUb2tlbi5jYWxsKHRoaXMsIG5hbWUsIHR5cGUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKTtcclxufTtcclxuTG9naWMucHJvdG90eXBlID0gbmV3IFRva2VuKCk7XHJcbkxvZ2ljLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvZ2ljO1xyXG5cclxuTG9naWMucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24oKSB7IC8vIFVzZSBhIGRlcml2ZWQgY2xhc3NcclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5cclxudmFyIEFjdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgVG9rZW4uY2FsbCh0aGlzLCBuYW1lLCBUeXBlLkFDVElPTiwgYXJncywgYXJndW1lbnRfdHlwZXMpO1xyXG59O1xyXG5BY3Rpb24ucHJvdG90eXBlID0gbmV3IFRva2VuKCk7XHJcbkFjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBY3Rpb247XHJcblxyXG5BY3Rpb24ucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHsgLy8gVXNlIGEgZGVyaXZlZCBjbGFzc1xyXG4gIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbkFjdGlvbi5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBlbnRpdGllcyA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB0aGlzLmVhY2goZW50aXRpZXNbaV0pO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG52YXIgRW50aXR5RmlsdGVyID0gZnVuY3Rpb24obmFtZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICBUb2tlbi5jYWxsKHRoaXMsIG5hbWUsIFR5cGUuRU5USVRZRklMVEVSLCBhcmdzLCBhcmd1bWVudF90eXBlcyk7XHJcbn07XHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUgPSBuZXcgVG9rZW4oKTtcclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVudGl0eUZpbHRlcjtcclxuXHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUuZGVjaWRlID0gZnVuY3Rpb24oZW50aXR5KSB7IC8vIFVzZSBkZXJpdmVkIGNsYXNzXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgcmV0ID0gW107XHJcbiAgdmFyIGVudGl0aWVzID0gX2VuZ2luZS5lbnRpdGllcygpO1xyXG4gIFxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmICh0aGlzLmRlY2lkZShlbnRpdGllc1tpXSkpXHJcbiAgICAgIHJldC5wdXNoKGVudGl0aWVzW2ldKTtcclxuICB9XHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLlRva2VuID0gVG9rZW47XHJcbm1vZHVsZS5leHBvcnRzLkxpdGVyYWwgPSBMaXRlcmFsO1xyXG5tb2R1bGUuZXhwb3J0cy5BY3Rpb24gPSBBY3Rpb247XHJcbm1vZHVsZS5leHBvcnRzLkxvZ2ljID0gTG9naWM7XHJcbm1vZHVsZS5leHBvcnRzLkVudGl0eUZpbHRlciA9IEVudGl0eUZpbHRlcjtcclxuXHJcbi8vIFRPRE86IGxpbmVhciBhY3Rpb24sIHBvcm92bmF2YW5pZSwgdWhseSwgcGx1cywgbWludXMgLCBkZWxlbm8sIGtyYXQsIHggbmEgbiIsInZhciBQYXJzZXIgPSByZXF1aXJlKFwiLi9wYXJzZXIuanNcIik7XHJcblxyXG52YXIgVG9rZW5NYW5hZ2VyID0gZnVuY3Rpb24gKCkge1xyXG4gIHRoaXMudG9rZW5zID0gW107XHJcblxyXG4gIHRoaXMucmVnaXN0ZXJUb2tlbnMocmVxdWlyZShcIi4vbG9naWMuanNcIikpO1xyXG4gIHRoaXMucmVnaXN0ZXJUb2tlbnMocmVxdWlyZShcIi4vYWN0aW9ucy5qc1wiKSk7XHJcbiAgdGhpcy5yZWdpc3RlclRva2VucyhyZXF1aXJlKFwiLi9lbnRpdHlmaWx0ZXJzLmpzXCIpKTtcclxuXHJcbiAgdGhpcy5wYXJzZXIgPSBuZXcgUGFyc2VyKHRoaXMpO1xyXG59O1xyXG5cclxuVG9rZW5NYW5hZ2VyLnByb3RvdHlwZS5yZWdpc3RlclRva2VucyA9IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICB0b2tlbnMuZm9yRWFjaChmdW5jdGlvbiAodG9rZW4pIHtcclxuICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IHRva2VuKCkpO1xyXG4gIH0sIHRoaXMpO1xyXG59O1xyXG5cclxuVG9rZW5NYW5hZ2VyLnByb3RvdHlwZS5nZXRUb2tlbkJ5TmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRva2Vucy5sZW5ndGg7IGkrKylcclxuICB7XHJcbiAgICBpZiAodGhpcy50b2tlbnNbaV0ubmFtZSA9PT0gbmFtZSlcclxuICAgICAgcmV0dXJuIHRoaXMudG9rZW5zW2ldO1xyXG4gIH1cclxufTtcclxuXHJcblRva2VuTWFuYWdlci5wcm90b3R5cGUuZ2V0VG9rZW5zQnlUeXBlID0gZnVuY3Rpb24gKHR5cGUpIHtcclxuICB2YXIgcmV0ID0gW107XHJcblxyXG4gIHRoaXMudG9rZW5zLmZvckVhY2goZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICBpZiAodG9rZW4udHlwZSA9PT0gdHlwZSlcclxuICAgICAgcmV0LnB1c2godG9rZW4pO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUb2tlbk1hbmFnZXI7IiwidmFyIFNoYXBlID0gcmVxdWlyZShcIi4vc2hhcGVzLmpzXCIpO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL2JvZHl0eXBlLmpzXCIpO1xyXG52YXIgQ29uc3RhbnRzID0gcmVxdWlyZShcIi4vY29uc3RhbnRzLmpzXCIpO1xyXG5cclxudmFyIEJsYW5rID0ge1xyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHt9LFxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge30sXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7fVxyXG59O1xyXG5cclxuXHJcbnZhciBTZWxlY3Rpb24gPSB7XHJcbiAgb3JpZ2luOiBudWxsLFxyXG4gIG9mZnNldDogbnVsbCxcclxuICBtb2RlOiBudWxsLFxyXG5cclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgaWYoX2VuZ2luZS5zZWxlY3RlZEVudGl0eSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9lbmdpbmUuc2VsZWN0ZWRFbnRpdHkuaGVscGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChfZW5naW5lLnNlbGVjdGVkRW50aXR5LmhlbHBlcnNbaV0udGVzdFBvaW50KF9lbmdpbmUuaW5wdXQubW91c2UueCwgX2VuZ2luZS5pbnB1dC5tb3VzZS55KSkge1xyXG4gICAgICAgICAgX2VuZ2luZS5zZWxlY3RlZEVudGl0eS5oZWxwZXJzW2ldLmNsaWNrKCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX2VuZ2luZS5zZWxlY3RFbnRpdHkobnVsbCk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IENvbnN0YW50cy5MQVlFUlNfTlVNQkVSIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBfZW5naW5lLmxheWVyc1tpXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIGlmIChfZW5naW5lLmxheWVyc1tpXVtqXS5maXh0dXJlLlRlc3RQb2ludChcclxuICAgICAgICAgICAgbmV3IGIyVmVjMihfZW5naW5lLmlucHV0Lm1vdXNlLngsIF9lbmdpbmUuaW5wdXQubW91c2UueSkpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBfZW5naW5lLnNlbGVjdEVudGl0eShfZW5naW5lLmxheWVyc1tpXVtqXSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5vcmlnaW4gPSBbX2VuZ2luZS5pbnB1dC5tb3VzZS54LCBfZW5naW5lLmlucHV0Lm1vdXNlLnldO1xyXG4gICAgICAgICAgdGhpcy5vZmZzZXQgPSBbXHJcbiAgICAgICAgICAgIF9lbmdpbmUuc2VsZWN0ZWRFbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF94KCkgLSB0aGlzLm9yaWdpblswXSxcclxuICAgICAgICAgICAgX2VuZ2luZS5zZWxlY3RlZEVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3koKSAtIHRoaXMub3JpZ2luWzFdXHJcbiAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgIHRoaXMubW9kZSA9IFwicmVwb3NpdGlvblwiO1xyXG4gICAgICAgICAgdGhpcy5vcmlnaW4gPSBbX2VuZ2luZS5pbnB1dC5tb3VzZS54LCBfZW5naW5lLmlucHV0Lm1vdXNlLnldO1xyXG5cclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1vZGUgPSBcImNhbWVyYVwiO1xyXG5cclxuICAgIHRoaXMub3JpZ2luID0gW19lbmdpbmUudmlld3BvcnQueCwgX2VuZ2luZS52aWV3cG9ydC55XTtcclxuICAgIHRoaXMub2Zmc2V0ID0gW19lbmdpbmUuaW5wdXQubW91c2UuY2FudmFzWCwgX2VuZ2luZS5pbnB1dC5tb3VzZS5jYW52YXNZXTtcclxuICAgIF9lbmdpbmUudmlld3BvcnQuY2FudmFzRWxlbWVudC5zdHlsZS5jdXJzb3IgPSBcInVybChpbWcvZ3JhYmJpbmdjdXJzb3IucG5nKSwgbW92ZVwiO1xyXG4gIH0sXHJcbiAgb25yZWxlYXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm9yaWdpbiA9IHRoaXMub2Zmc2V0ID0gdGhpcy5tb2RlID0gbnVsbDtcclxuICAgIF9lbmdpbmUudmlld3BvcnQuY2FudmFzRWxlbWVudC5zdHlsZS5jdXJzb3IgPSBcImRlZmF1bHRcIjtcclxuICB9LFxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gbnVsbClcclxuICAgICAgcmV0dXJuO1xyXG5cclxuICAgIGlmICh0aGlzLm1vZGUgPT09IFwiY2FtZXJhXCIpIHtcclxuICAgICAgX2VuZ2luZS52aWV3cG9ydC54ID0gdGhpcy5vcmlnaW5bMF0gKyBfZW5naW5lLnZpZXdwb3J0LnRvU2NhbGUodGhpcy5vZmZzZXRbMF0gLSBfZW5naW5lLmlucHV0Lm1vdXNlLmNhbnZhc1gpO1xyXG4gICAgICBfZW5naW5lLnZpZXdwb3J0LnkgPSB0aGlzLm9yaWdpblsxXSArIF9lbmdpbmUudmlld3BvcnQudG9TY2FsZSh0aGlzLm9mZnNldFsxXSAtIF9lbmdpbmUuaW5wdXQubW91c2UuY2FudmFzWSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJyZXBvc2l0aW9uXCIpIHtcclxuICAgICAgdmFyIGJvZHkgPSBfZW5naW5lLnNlbGVjdGVkRW50aXR5LmJvZHk7XHJcbiAgICAgIHZhciB4ID0gTWF0aC5yb3VuZCgoX2VuZ2luZS5pbnB1dC5tb3VzZS54ICsgdGhpcy5vZmZzZXRbMF0pICogMTAwMCkgLyAxMDAwO1xyXG4gICAgICB2YXIgeSA9IE1hdGgucm91bmQoKF9lbmdpbmUuaW5wdXQubW91c2UueSArIHRoaXMub2Zmc2V0WzFdKSAqIDEwMDApIC8gMTAwMDtcclxuXHJcbiAgICAgIGJvZHkuU2V0VHJhbnNmb3JtKG5ldyBiMlZlYzIoeCwgeSksIGJvZHkuR2V0QW5nbGUoKSk7XHJcbiAgICAgICQoXCIjZW50aXR5X3hcIikudmFsKHgpO1xyXG4gICAgICAkKFwiI2VudGl0eV95XCIpLnZhbCh5KTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5cclxudmFyIFJlY3RhbmdsZSA9IHtcclxuICBvcmlnaW46IG51bGwsXHJcbiAgd29ybGRPcmlnaW46IG51bGwsXHJcbiAgdzogMCxcclxuICBoOiAwLFxyXG5cclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm9ubW92ZSA9IHRoaXMuZHJhZ2dpbmc7XHJcbiAgICB0aGlzLm9yaWdpbiA9IFtfZW5naW5lLmlucHV0Lm1vdXNlLmNhbnZhc1gsIF9lbmdpbmUuaW5wdXQubW91c2UuY2FudmFzWV07XHJcbiAgICB0aGlzLndvcmxkT3JpZ2luID0gW19lbmdpbmUuaW5wdXQubW91c2UueCwgX2VuZ2luZS5pbnB1dC5tb3VzZS55XTtcclxuICB9LFxyXG5cclxuICBvbnJlbGVhc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmIChcclxuICAgICAgdGhpcy53ID49IF9lbmdpbmUudmlld3BvcnQuZnJvbVNjYWxlKENvbnN0YW50cy5TSEFQRV9NSU5fU0laRSkgJiZcclxuICAgICAgdGhpcy5oID49IF9lbmdpbmUudmlld3BvcnQuZnJvbVNjYWxlKENvbnN0YW50cy5TSEFQRV9NSU5fU0laRSlcclxuICAgICkge1xyXG4gICAgICB0aGlzLncgKj0gX2VuZ2luZS52aWV3cG9ydC5zY2FsZTtcclxuICAgICAgdGhpcy5oICo9IF9lbmdpbmUudmlld3BvcnQuc2NhbGU7XHJcblxyXG4gICAgICBfZW5naW5lLmFkZEVudGl0eShuZXcgU2hhcGUuUmVjdGFuZ2xlKFxyXG4gICAgICAgIG5ldyBiMlZlYzIodGhpcy53b3JsZE9yaWdpblswXSArIHRoaXMudyAvIDIsIHRoaXMud29ybGRPcmlnaW5bMV0gKyB0aGlzLmggLyAyKSxcclxuICAgICAgICBuZXcgYjJWZWMyKHRoaXMudyAvIDIsIHRoaXMuaCAvIDIpKSwgVHlwZS5EWU5BTUlDX0JPRFkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMub25tb3ZlID0gZnVuY3Rpb24oKXt9O1xyXG4gICAgdGhpcy5vcmlnaW4gPSBudWxsO1xyXG4gICAgdGhpcy53b3JsZE9yaWdpbiA9IG51bGw7XHJcbiAgICB0aGlzLncgPSB0aGlzLmggPSAwO1xyXG4gIH0sXHJcblxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICB9LFxyXG5cclxuICBkcmFnZ2luZzogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgdGhpcy53ID0gX2VuZ2luZS5pbnB1dC5tb3VzZS5jYW52YXNYIC0gdGhpcy5vcmlnaW5bMF07XHJcbiAgICB0aGlzLmggPSBfZW5naW5lLmlucHV0Lm1vdXNlLmNhbnZhc1kgLSB0aGlzLm9yaWdpblsxXTtcclxuXHJcbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsIDAsIDAsIDAuNClcIjtcclxuICAgIGlmIChcclxuICAgICAgdGhpcy53IDwgX2VuZ2luZS52aWV3cG9ydC5mcm9tU2NhbGUoQ29uc3RhbnRzLlNIQVBFX01JTl9TSVpFKSB8fFxyXG4gICAgICB0aGlzLmggPCBfZW5naW5lLnZpZXdwb3J0LmZyb21TY2FsZShDb25zdGFudHMuU0hBUEVfTUlOX1NJWkUpXHJcbiAgICApIHtcclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsIDAsIDAsIDAuNClcIjtcclxuICAgIH1cclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZmlsbFJlY3QodGhpcy5vcmlnaW5bMF0sIHRoaXMub3JpZ2luWzFdLCB0aGlzLncsIHRoaXMuaCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG52YXIgQ2lyY2xlID0ge1xyXG4gIG9yaWdpbjogbnVsbCxcclxuICB3b3JsZE9yaWdpbjogbnVsbCxcclxuICByYWRpdXM6IDAsXHJcblxyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMub25tb3ZlID0gdGhpcy5kcmFnZ2luZztcclxuICAgIHRoaXMub3JpZ2luID0gW19lbmdpbmUuaW5wdXQubW91c2UuY2FudmFzWCwgX2VuZ2luZS5pbnB1dC5tb3VzZS5jYW52YXNZXTtcclxuICAgIHRoaXMud29ybGRPcmlnaW4gPSBbX2VuZ2luZS5pbnB1dC5tb3VzZS54LCBfZW5naW5lLmlucHV0Lm1vdXNlLnldO1xyXG4gIH0sXHJcblxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMucmFkaXVzID49IF9lbmdpbmUudmlld3BvcnQuZnJvbVNjYWxlKENvbnN0YW50cy5TSEFQRV9NSU5fU0laRSkgLyAyKSB7XHJcbiAgICAgIHRoaXMucmFkaXVzICo9IF9lbmdpbmUudmlld3BvcnQuc2NhbGU7XHJcblxyXG4gICAgICBfZW5naW5lLmFkZEVudGl0eShuZXcgU2hhcGUuQ2lyY2xlKFxyXG4gICAgICAgIG5ldyBiMlZlYzIodGhpcy53b3JsZE9yaWdpblswXSArIHRoaXMucmFkaXVzLCB0aGlzLndvcmxkT3JpZ2luWzFdICsgdGhpcy5yYWRpdXMpLFxyXG4gICAgICAgIHRoaXMucmFkaXVzKSwgVHlwZS5EWU5BTUlDX0JPRFkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMub25tb3ZlID0gZnVuY3Rpb24oKXt9O1xyXG4gICAgdGhpcy5vcmlnaW4gPSBudWxsO1xyXG4gICAgdGhpcy53b3JsZE9yaWdpbiA9IG51bGw7XHJcbiAgICB0aGlzLnJhZGl1cyA9IDA7XHJcbiAgfSxcclxuXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIH0sXHJcblxyXG4gIGRyYWdnaW5nOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICB0aGlzLnJhZGl1cyA9IE1hdGgubWluKF9lbmdpbmUuaW5wdXQubW91c2UuY2FudmFzWCAtIHRoaXMub3JpZ2luWzBdLCBfZW5naW5lLmlucHV0Lm1vdXNlLmNhbnZhc1kgLSB0aGlzLm9yaWdpblsxXSkgLyAyO1xyXG5cclxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgMC40KVwiO1xyXG5cclxuICAgIGlmICh0aGlzLnJhZGl1cyA8IF9lbmdpbmUudmlld3BvcnQuZnJvbVNjYWxlKENvbnN0YW50cy5TSEFQRV9NSU5fU0laRSkgLyAyKSB7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LCAwLCAwLCAwLjQpXCI7XHJcbiAgICB9XHJcblxyXG4gICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcblxyXG4gICAgY3R4LmFyYyh0aGlzLm9yaWdpblswXSArIHRoaXMucmFkaXVzLCB0aGlzLm9yaWdpblsxXSArIHRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cywgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5CbGFuayA9IEJsYW5rO1xyXG5tb2R1bGUuZXhwb3J0cy5TZWxlY3Rpb24gPSBTZWxlY3Rpb247XHJcbm1vZHVsZS5leHBvcnRzLlJlY3RhbmdsZSA9IFJlY3RhbmdsZTtcclxubW9kdWxlLmV4cG9ydHMuQ2lyY2xlID0gQ2lyY2xlOyIsIi8vIEEgY2xhc3MgZm9yIGZhY2lsaXRhdGluZyBpbnRlcm5hdGlvbmFsaXNhdGlvblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBzdHJpbmdzOiBbcmVxdWlyZSgnLi4vdHJhbnNsYXRpb25zL2VuZ2xpc2guanMnKSwgcmVxdWlyZSgnLi4vdHJhbnNsYXRpb25zL3Nsb3Zhay5qcycpXSwgLy8gQXJyYXkgb2YgbGFuZ3VhZ2VzIChlYWNoIGxhbmd1YWdlIGlzIGFuIGFycmF5IG9mIHN0cmluZ3MpXHJcbiAgY3VycmVudExhbmd1YWdlOiAwLCAvLyBzZWxlY3RlZCBsYW5ndWFnZVxyXG5cclxuICBnZXRUcmFuc2xhdGVkOiBmdW5jdGlvbihyb3V0ZSwgbGFuZ3VhZ2UpIHtcclxuICAgIGlmIChsYW5ndWFnZSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgbGFuZ3VhZ2UgPSB0aGlzLmN1cnJlbnRMYW5ndWFnZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdHJhbnNsYXRpb24gPSB0aGlzLnN0cmluZ3NbbGFuZ3VhZ2VdO1xyXG5cclxuICAgIHZhciBzdGVwcyA9IHJvdXRlLnNwbGl0KCcuJyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ZXBzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBzdGVwID0gc3RlcHNbaV07XHJcbiAgICAgIGlmIChzdGVwIGluIHRyYW5zbGF0aW9uKSB7XHJcbiAgICAgICAgdHJhbnNsYXRpb24gPSB0cmFuc2xhdGlvbltzdGVwXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aHJvdyBcIkVSUk9SISBObyB0cmFuc2xhdGlvbiBmb3IgXCIgKyByb3V0ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRyYW5zbGF0aW9uO1xyXG4gIH0sXHJcblxyXG4gIGdldFRyYW5zbGF0ZWRXcmFwcGVkOiBmdW5jdGlvbihyb3V0ZSwgbGFuZ3VhZ2UpIHtcclxuICAgIHZhciByZXQgPSBlbChcInNwYW5cIiwge3RyYW5zbGF0aW9uOiByb3V0ZX0pO1xyXG4gICAgcmV0LmlubmVySFRNTCA9IHRoaXMuZ2V0VHJhbnNsYXRlZChyb3V0ZSwgbGFuZ3VhZ2UpO1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgc2V0TGFuZ3VhZ2U6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICB0aGlzLmN1cnJlbnRMYW5ndWFnZSA9IGluZGV4O1xyXG5cclxuICAgIHZhciB0cmFuc2xhdGVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIlt0cmFuc2xhdGlvbl1cIik7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYW5zbGF0ZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdHJhbnNsYXRlZFtpXS5pbm5lckhUTUwgPSB0aGlzLmdldFRyYW5zbGF0ZWQodHJhbnNsYXRlZFtpXS5nZXRBdHRyaWJ1dGUoXCJ0cmFuc2xhdGlvblwiKSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcmVmcmVzaDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5zZXRMYW5ndWFnZSh0aGlzLmN1cnJlbnRMYW5ndWFnZSk7XHJcbiAgfVxyXG59OyIsInZhciBUeXBlID0ge1xyXG4gIEJPT0xFQU46IFwiYm9vbGVhblwiLFxyXG4gIE5VTUJFUjogXCJudW1iZXJcIixcclxuICBTVFJJTkc6IFwic3RyaW5nXCIsXHJcbiAgQVJSQVk6IFwiYXJyYXlcIixcclxuICBBQ1RJT046IFwiYWN0aW9uXCIsXHJcbiAgRU5USVRZRklMVEVSOiBcImVudGl0eUZpbHRlclwiLFxyXG4gIExJVEVSQUw6IFwibGl0ZXJhbFwiXHJcbn07XHJcblxyXG52YXIgRml4VHlwZSA9IHtcclxuICBJTkZJWDogXCJpbmZpeFwiLFxyXG4gIFBSRUZJWDogXCJwcmVmaXhcIlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMuVHlwZSA9IFR5cGU7XHJcbm1vZHVsZS5leHBvcnRzLkZpeFR5cGUgPSBGaXhUeXBlOyIsInZhciBUb29scyA9IHJlcXVpcmUoXCIuL3Rvb2xzLmpzXCIpO1xyXG52YXIgQm9keVR5cGUgPSByZXF1aXJlKFwiLi9ib2R5dHlwZS5qc1wiKTtcclxudmFyIFVJQnVpbGRlciA9IHJlcXVpcmUoXCIuL3VpYnVpbGRlci5qc1wiKTtcclxudmFyIENvbnN0YW50cyA9IHJlcXVpcmUoXCIuL2NvbnN0YW50cy5qc1wiKTtcclxudmFyIFRyYW5zbGF0aW9ucyA9IHJlcXVpcmUoXCIuL3RyYW5zbGF0aW9ucy5qc1wiKTtcclxuXHJcbi8vIE9iamVjdCBmb3IgYnVpbGRpbmcgdGhlIFVJXHJcbnZhciBVSSA9IHtcclxuICAvLyBVSSBpbml0aWFsaXNhdGlvblxyXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGxhbmd1YWdlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBUcmFuc2xhdGlvbnMuc3RyaW5ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBsYW5ndWFnZXMucHVzaCh7dGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWQoXCJMQU5HVUFHRV9OQU1FXCIsIGkpLCB2YWx1ZTogaX0pO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwcm9wZXJ0aWVzID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogXCJidXR0b25cIixcclxuXHJcbiAgICAgICAgaWQ6IFwicGxheVwiLFxyXG4gICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIlNUQVJUXCIpLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIF9lbmdpbmUudG9nZ2xlUGF1c2UoKTtcclxuXHJcbiAgICAgICAgICBpZiAoX2VuZ2luZS53b3JsZC5wYXVzZWQpIHtcclxuICAgICAgICAgICAgJChcIiNwbGF5XCIpLmh0bWwoVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKFwiU1RBUlRcIikpO1xyXG5cclxuICAgICAgICAgICAgJChcIiNjb2xsaXNpb25zLCAjdG9vbFwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0aGlzLmVuYWJsZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiI3BsYXlcIikuaHRtbChUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoXCJQQVVTRVwiKSk7XHJcblxyXG4gICAgICAgICAgICAkKFwiI2NvbGxpc2lvbnMsICN0b29sXCIpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHRoaXMuZGlzYWJsZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHt0eXBlOiBcImJyZWFrXCJ9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogXCJidXR0b25cIixcclxuXHJcbiAgICAgICAgaWQ6IFwiY29sbGlzaW9uc1wiLFxyXG4gICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIkNPTExJU0lPTl9HUk9VUFNcIiksXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgVUlCdWlsZGVyLnBvcHVwKFVJLmNyZWF0ZUNvbGxpc2lvbnMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7dHlwZTogXCJicmVha1wifSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKFwiVE9PTFwiKSB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogXCJyYWRpb1wiLFxyXG5cclxuICAgICAgICBpZDogXCJ0b29sXCIsXHJcbiAgICAgICAgZWxlbWVudHM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogZWwuaW1nKHtzcmM6IFwiLi9pbWcvc2VsZWN0aW9uLnN2Z1wifSksIGlkOiBcInNlbGVjdGlvblRvb2xcIiwgY2hlY2tlZDogdHJ1ZSwgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfZW5naW5lLnNlbGVjdFRvb2woVG9vbHMuU2VsZWN0aW9uKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6IGVsLmltZyh7c3JjOiBcIi4vaW1nL3JlY3RhbmdsZS5zdmdcIn0pLCBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF9lbmdpbmUuc2VsZWN0VG9vbChUb29scy5SZWN0YW5nbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogZWwuaW1nKHtzcmM6IFwiLi9pbWcvY2lyY2xlLnN2Z1wifSksIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX2VuZ2luZS5zZWxlY3RUb29sKFRvb2xzLkNpcmNsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAge3R5cGU6IFwiYnJlYWtcIn0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIlpPT01cIikgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwicmFuZ2VcIixcclxuXHJcbiAgICAgICAgbWluOiAxLFxyXG4gICAgICAgIG1heDogMTEsXHJcbiAgICAgICAgc3RlcDogMC4xLFxyXG4gICAgICAgIHZhbHVlOiA2LFxyXG4gICAgICAgIHdpZHRoOiBcIjE1MHB4XCIsXHJcbiAgICAgICAgZGlzYWJsZVdyaXRlOiB0cnVlLFxyXG5cclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgIF9lbmdpbmUudmlld3BvcnQuem9vbSh2YWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge3R5cGU6IFwiYnJlYWtcIn0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcInNlbGVjdFwiLFxyXG4gICAgICAgIG9wdGlvbnM6IGxhbmd1YWdlcyxcclxuXHJcbiAgICAgICAgb25jaGFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgVHJhbnNsYXRpb25zLnNldExhbmd1YWdlKHZhbHVlICogMSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgfVxyXG4gICAgXTtcclxuXHJcbiAgICBVSUJ1aWxkZXIuYnVpbGRMYXlvdXQoKTtcclxuICAgICQoXCIudWkudG9vbGJhclwiKVswXS5hcHBlbmRDaGlsZChVSUJ1aWxkZXIuYnVpbGQocHJvcGVydGllcykpO1xyXG4gICAgJChcIi51aS5jb250ZW50XCIpWzBdLmFwcGVuZENoaWxkKGVsKFwiY2FudmFzI21haW5DYW52YXNcIikpO1xyXG5cclxuICB9LFxyXG5cclxuICAvLyBCdWlsZGluZyB0aGUgY29sbGlzaW9uIGdyb3VwIHRhYmxlXHJcbiAgY3JlYXRlQ29sbGlzaW9uczogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGFibGUgPSBlbChcInRhYmxlLmNvbGxpc2lvblRhYmxlXCIpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQ29uc3RhbnRzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSOyBpKyspIHtcclxuICAgICAgdmFyIHRyID0gZWwoXCJ0clwiKTtcclxuXHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgQ29uc3RhbnRzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSOyBqKyspIHtcclxuICAgICAgICB2YXIgdGQgPSBlbChcInRkXCIpO1xyXG5cclxuICAgICAgICAvLyBmaXJzdCByb3dcclxuICAgICAgICBpZiAoaSA9PT0gMCAmJiBqID4gMCkge1xyXG4gICAgICAgICAgdGQuaW5uZXJIVE1MID0gXCI8ZGl2PjxzcGFuPlwiICsgX2VuZ2luZS5jb2xsaXNpb25Hcm91cHNbaiAtIDFdLm5hbWUgKyBcIjwvc3Bhbj48L2Rpdj5cIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpcnN0IGNvbHVtblxyXG4gICAgICAgIGVsc2UgaWYgKGogPT09IDAgJiYgaSAhPT0gMClcclxuICAgICAgICAgIHRkLmlubmVySFRNTCA9IF9lbmdpbmUuY29sbGlzaW9uR3JvdXBzW2kgLSAxXS5uYW1lO1xyXG5cclxuICAgICAgICAvLyByZWxldmFudCB0cmlhbmdsZVxyXG4gICAgICAgIGVsc2UgaWYgKGkgPD0gaiAmJiBqICE9PSAwICYmIGkgIT09IDApIHtcclxuICAgICAgICAgIHRkLnJvdyA9IGk7XHJcbiAgICAgICAgICB0ZC5jb2wgPSBqO1xyXG5cclxuICAgICAgICAgIC8vIGhpZ2hsaWdodGluZ1xyXG4gICAgICAgICAgdGQub25tb3VzZW92ZXIgPSBmdW5jdGlvbihpLCBqLCB0YWJsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHRkcyA9IHRhYmxlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGRcIik7XHJcbiAgICAgICAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCB0ZHMubGVuZ3RoOyBuKyspIHtcclxuICAgICAgICAgICAgICAgIHRkc1tuXS5jbGFzc05hbWUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG9ubHkgaGlnaGxpZ2h0IHVwIHRvIHRoZSByZWxldmFudCBjZWxsXHJcbiAgICAgICAgICAgICAgICBpZiAoKHRkc1tuXS5yb3cgPT09IGkgJiYgdGRzW25dLmNvbCA8PSBqKSB8fCAodGRzW25dLmNvbCA9PT0gaiAmJiB0ZHNbbl0ucm93IDw9IGkpKVxyXG4gICAgICAgICAgICAgICAgICB0ZHNbbl0uY2xhc3NOYW1lID0gXCJoaWdobGlnaHRcIjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9KGksIGosIHRhYmxlKTtcclxuXHJcbiAgICAgICAgICAvLyBtb3JlIGhpZ2hsaWdodGluZ1xyXG4gICAgICAgICAgdGQub25tb3VzZW91dCA9IGZ1bmN0aW9uKHRhYmxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICB2YXIgdGRzID0gdGFibGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0ZFwiKTtcclxuICAgICAgICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IHRkcy5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgICAgICAgICAgdGRzW25dLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfSh0YWJsZSk7XHJcblxyXG4gICAgICAgICAgLy8gY2hlY2tib3ggZm9yIGNvbGxpc2lvbiB0b2dnbGluZ1xyXG4gICAgICAgICAgdmFyIGNoZWNrYm94ID0gZWwoXCJpbnB1dFwiLCB7dHlwZTogXCJjaGVja2JveFwifSk7XHJcblxyXG4gICAgICAgICAgaWYgKF9lbmdpbmUuZ2V0Q29sbGlzaW9uKGkgLSAxLCBqIC0gMSkpXHJcbiAgICAgICAgICAgIGNoZWNrYm94LnNldEF0dHJpYnV0ZShcImNoZWNrZWRcIiwgXCJjaGVja2VkXCIpO1xyXG5cclxuICAgICAgICAgIGNoZWNrYm94Lm9uY2hhbmdlID0gZnVuY3Rpb24oaSwgaiwgY2hlY2tib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIF9lbmdpbmUuc2V0Q29sbGlzaW9uKGkgLSAxLCBqIC0gMSwgY2hlY2tib3guY2hlY2tlZCA/IDEgOiAwKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0oaSwgaiwgY2hlY2tib3gpO1xyXG5cclxuICAgICAgICAgIC8vIGNsaWNraW5nIHRoZSBjaGVja2JveCdzIGNlbGwgc2hvdWxkIHdvcmsgYXMgd2VsbFxyXG4gICAgICAgICAgdGQub25jbGljayA9IGZ1bmN0aW9uKGNoZWNrYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0ID09PSBjaGVja2JveClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gIWNoZWNrYm94LmNoZWNrZWQ7XHJcbiAgICAgICAgICAgICAgY2hlY2tib3gub25jaGFuZ2UoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0oY2hlY2tib3gpO1xyXG5cclxuICAgICAgICAgIHRkLmFwcGVuZENoaWxkKGNoZWNrYm94KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpeCBmb3IgYWxzbyBoaWdobGlnaHRpbmcgY2VsbHMgd2l0aG91dCBjaGVja2JveGVzXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0ZC5yb3cgPSBpO1xyXG4gICAgICAgICAgdGQuY29sID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGFibGUuYXBwZW5kQ2hpbGQodHIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YWJsZTtcclxuICB9LFxyXG5cclxuICBjcmVhdGVCZWhhdmlvcjogZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gICAgdmFyIEJlaGF2aW9yQnVpbGRlciA9IG5ldyAocmVxdWlyZShcIi4vYmVoYXZpb3JidWlsZGVyLmpzXCIpKShfZW5naW5lLnRva2VuTWFuYWdlcik7XHJcbiAgICB2YXIgVUlCdWlsZGVyID0gcmVxdWlyZShcIi4vdWlidWlsZGVyLmpzXCIpO1xyXG4gICAgdmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbiAgICB2YXIgb25lQmVoYXZpb3IgPSBmdW5jdGlvbihiZWhhdmlvcikge1xyXG4gICAgICB2YXIgd3JhcHBlciA9IGVsKFwiZGl2LmJlaGF2aW9yXCIpO1xyXG4gICAgICB2YXIgbG9naWMgPSBlbChcImRpdi50b2tlbkJ1aWxkZXJcIiwge30sIFtcIlwiXSk7XHJcbiAgICAgIHZhciByZXN1bHRzID0gZWwoXCJkaXZcIik7XHJcblxyXG4gICAgICB2YXIgcmVtb3ZlciA9IFVJQnVpbGRlci5idXR0b24oe1xyXG4gICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIkJFSEFWSU9SUy5SRU1PVkVfQkVIQVZJT1JcIiksIG9uY2xpY2s6IChmdW5jdGlvbiAod3JhcHBlcikge1xyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIGZ1bmN0aW9uIGlzbid0IHdyYXBwZWQsIG9ubHkgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgYmVoYXZpb3IgZ2V0cyBwYXNzZWRcclxuXHJcbiAgICAgICAgICAgICQod3JhcHBlcikucmVtb3ZlKCk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pKHdyYXBwZXIpXHJcbiAgICAgIH0pO1xyXG4gICAgICByZW1vdmVyLnN0eWxlLmZsb2F0ID0gXCJyaWdodFwiO1xyXG5cclxuICAgICAgaWYgKGJlaGF2aW9yID09PSBudWxsKSB7XHJcbiAgICAgICAgQmVoYXZpb3JCdWlsZGVyLmluaXRpYWxpemUoVHlwZS5CT09MRUFOLCBsb2dpYyk7XHJcblxyXG4gICAgICAgIHJlc3VsdHMuYXBwZW5kQ2hpbGQob25lUmVzdWx0KG51bGwsIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIkJFSEFWSU9SUy5BQ1RJT05cIiksIGZhbHNlKSk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgQmVoYXZpb3JCdWlsZGVyLmJ1aWxkVG9rZW4oYmVoYXZpb3IubG9naWMsIGxvZ2ljLmZpcnN0Q2hpbGQpO1xyXG5cclxuICAgICAgICByZXN1bHRzLmFwcGVuZENoaWxkKG9uZVJlc3VsdChiZWhhdmlvci5yZXN1bHRzWzBdLCBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoXCJCRUhBVklPUlMuQUNUSU9OXCIpLCBmYWxzZSkpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGJlaGF2aW9yLnJlc3VsdHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgIHJlc3VsdHMuYXBwZW5kQ2hpbGQob25lUmVzdWx0KGJlaGF2aW9yLnJlc3VsdHNbal0sIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIkJFSEFWSU9SUy5BTk9USEVSX0FDVElPTlwiKSwgdHJ1ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuXHJcbiAgICAgIHJlc3VsdHMuYXBwZW5kQ2hpbGQoVUlCdWlsZGVyLmJ1dHRvbih7dGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKFwiQkVIQVZJT1JTLk5FV19BQ1RJT05cIiksIG9uY2xpY2s6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShvbmVSZXN1bHQobnVsbCwgVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKFwiQkVIQVZJT1JTLkFOT1RIRVJfQUNUSU9OXCIpLCB0cnVlKSwgdGhpcyk7XHJcbiAgICAgIH19KSk7XHJcblxyXG4gICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGVsKFwiaDJcIiwge30sIFtUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoXCJCRUhBVklPUlMuQ09ORElUSU9OXCIpLCByZW1vdmVyXSkpO1xyXG4gICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGxvZ2ljKTtcclxuICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChyZXN1bHRzKTtcclxuXHJcbiAgICAgIHJldHVybiB3cmFwcGVyO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgb25lUmVzdWx0ID0gZnVuY3Rpb24ocmVzdWx0LCB0ZXh0LCBlbmFibGVSZW1vdmUpIHtcclxuICAgICAgdmFyIHdyYXBwZXIgPSBlbChcImRpdlwiKTtcclxuICAgICAgdmFyIHJlc3VsdEVsZW1lbnQgPSBlbChcImRpdi50b2tlbkJ1aWxkZXJcIiwge30sIFtcIlwiXSk7XHJcblxyXG4gICAgICB2YXIgcmVzdWx0UmVtb3ZlciA9IFVJQnVpbGRlci5idXR0b24oe3RleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIkJFSEFWSU9SUy5SRU1PVkVfQkVIQVZJT1JcIiksIG9uY2xpY2s6XHJcbiAgICAgICAgKGZ1bmN0aW9uKHJlc3VsdEVsZW1lbnQpe3JldHVybiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgLy8gSWYgdGhlIGZ1bmN0aW9uIGlzbid0IHdyYXBwZWQsIG9ubHkgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgcmVzdWx0IGdldHMgcGFzc2VkXHJcblxyXG4gICAgICAgICAgJChyZXN1bHRFbGVtZW50KS5wcmV2KCkucmVtb3ZlKCk7IC8vIFJlbW92ZSB0aGUgaGVhZGVyXHJcbiAgICAgICAgICAkKHJlc3VsdEVsZW1lbnQpLnJlbW92ZSgpOyAvLyBBbmQgdGhlIHRva2VuIGJ1aWxkZXJcclxuICAgICAgICB9O30pKHJlc3VsdEVsZW1lbnQpfSk7XHJcbiAgICAgIHJlc3VsdFJlbW92ZXIuc3R5bGUuZmxvYXQgPSBcInJpZ2h0XCI7XHJcblxyXG4gICAgICBpZighIGVuYWJsZVJlbW92ZSlcclxuICAgICAgICByZXN1bHRSZW1vdmVyID0gXCJcIjtcclxuXHJcbiAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQoZWwoXCJoMlwiLCB7fSwgW1xyXG4gICAgICAgIHRleHQsXHJcbiAgICAgICAgcmVzdWx0UmVtb3ZlclxyXG4gICAgICBdKSk7XHJcbiAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQocmVzdWx0RWxlbWVudCk7XHJcblxyXG4gICAgICBpZihyZXN1bHQgPT09IG51bGwpXHJcbiAgICAgICAgQmVoYXZpb3JCdWlsZGVyLmluaXRpYWxpemUoVHlwZS5BQ1RJT04sIHJlc3VsdEVsZW1lbnQpO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgQmVoYXZpb3JCdWlsZGVyLmJ1aWxkVG9rZW4ocmVzdWx0LCByZXN1bHRFbGVtZW50LmZpcnN0Q2hpbGQpO1xyXG5cclxuICAgICAgcmV0dXJuIHdyYXBwZXI7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcImRpdi5iZWhhdmlvcldyYXBwZXJcIik7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdHkuYmVoYXZpb3JzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChvbmVCZWhhdmlvcihlbnRpdHkuYmVoYXZpb3JzW2ldKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHZhciBidXR0b25zID0gZWwoXCJkaXYuYm90dG9tXCIsIHt9LCBbXHJcbiAgICAgIFVJQnVpbGRlci5idXR0b24oe1xyXG4gICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIkJFSEFWSU9SUy5ORVdfQkVIQVZJT1JcIiksXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgcmV0LmFwcGVuZENoaWxkKG9uZUJlaGF2aW9yKG51bGwpKTtcclxuICAgICAgICAgIHJldC5zY3JvbGxUb3AgPSByZXQuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgfSksXHJcbiAgICAgIFVJQnVpbGRlci5icmVhaygpLFxyXG4gICAgICBVSUJ1aWxkZXIuYnV0dG9uKHtcclxuICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoXCJCRUhBVklPUlMuQ0FOQ0VMX0JVVFRPTlwiKSxcclxuICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBVSUJ1aWxkZXIuY2xvc2VQb3B1cCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSksXHJcbiAgICAgIFVJQnVpbGRlci5idXR0b24oe1xyXG4gICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIkJFSEFWSU9SUy5ET05FX0JVVFRPTlwiKSxcclxuICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICB0aGF0LnNhdmVCZWhhdmlvcihlbnRpdHkpO1xyXG4gICAgICAgICAgVUlCdWlsZGVyLmNsb3NlUG9wdXAoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pLFxyXG4gICAgXSk7XHJcbiAgICB2YXIgd3JhcHBlciA9IGVsKFwiZGl2XCIsIHt9LCBbcmV0LCBidXR0b25zXSk7XHJcblxyXG4gICAgcmV0dXJuIHdyYXBwZXI7XHJcbiAgfSxcclxuXHJcbiAgc2F2ZUJlaGF2aW9yOiBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgICB2YXIgQmVoYXZpb3IgPSByZXF1aXJlKFwiLi9iZWhhdmlvci5qc1wiKTtcclxuXHJcbiAgICBlbnRpdHkuYmVoYXZpb3JzID0gW107XHJcbiAgICB2YXIgYmVoYXZpb3JzID0gJChcIi5iZWhhdmlvcldyYXBwZXIgLmJlaGF2aW9yXCIpO1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBiZWhhdmlvcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHRva2VuQnVpbGRlcnMgPSAkKFwiLnRva2VuQnVpbGRlclwiLCBiZWhhdmlvcnNbaV0pO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICB2YXIgbG9naWMgPSBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UodG9rZW5CdWlsZGVyc1swXS50ZXh0Q29udGVudCk7XHJcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yKHZhciBqID0gMTsgaiA8IHRva2VuQnVpbGRlcnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UodG9rZW5CdWlsZGVyc1tqXS50ZXh0Q29udGVudCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2F0Y2ggKGVycikge31cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgIHRocm93IFwiQWxsIHJlc3VsdHMgYmxhbmtcIjtcclxuXHJcbiAgICAgICAgZW50aXR5LmJlaGF2aW9ycy5wdXNoKG5ldyBCZWhhdmlvcihsb2dpYywgcmVzdWx0cykpO1xyXG4gICAgICB9XHJcbiAgICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICAvLyBJZ25vcmUgcGFyc2luZyBlcnJvcnMgKHNvbWV0aGluZyBsZWZ0IGJsYW5rKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgYnVpbGRTaWRlYmFyOiBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgICB2YXIgc2lkZWJhciA9ICQoXCIuc2lkZWJhci51aSAuY29udGVudFwiKTtcclxuXHJcbiAgICBzaWRlYmFyLmh0bWwoXCJcIik7XHJcblxyXG4gICAgaWYgKGVudGl0eSA9PT0gbnVsbCkge1xyXG4gICAgICAkKFwiLnNpZGViYXIudWkgLmNvbnRlbnRcIikuaHRtbCh0aGlzLmJ1aWxkRW50aXR5TGlzdCgpKTtcclxuXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcHJvcGVydGllcyA9IFtcclxuICAgICAgLy8gSURcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKFwiU0lERUJBUi5JRFwiKX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dFRleHRcIiwgdmFsdWU6IGVudGl0eS5pZCwgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge19lbmdpbmUuY2hhbmdlSWQoZW50aXR5LCB2YWwpO319LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gQ29sbGlzaW9uIGdyb3VwXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIlNJREVCQVIuQ09MTElTSU9OX0dST1VQXCIpfSxcclxuICAgICAgeyB0eXBlOiBcInJhbmdlXCIsIHZhbHVlOiBlbnRpdHkuY29sbGlzaW9uR3JvdXAgKyAxLCBtaW46IDEsIG1heDogQ29uc3RhbnRzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSIC0gMSxcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LnNldENvbGxpc2lvbkdyb3VwKHZhbCAqIDEgLSAxKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIExheWVyXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIlNJREVCQVIuTEFZRVJcIil9LFxyXG4gICAgICB7IHR5cGU6IFwicmFuZ2VcIiwgdmFsdWU6IGVudGl0eS5sYXllciArIDEsIG1pbjogMSwgbWF4OiBDb25zdGFudHMuTEFZRVJTX05VTUJFUixcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7IF9lbmdpbmUuc2V0RW50aXR5TGF5ZXIoZW50aXR5LCB2YWwqMSAtIDEpOyB9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIFhcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKFwiU0lERUJBUi5YXCIpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF94KCksIGlkOiBcImVudGl0eV94XCIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgICAgZW50aXR5LmJvZHkuU2V0VHJhbnNmb3JtKG5ldyBiMlZlYzIodmFsICogMSwgZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpKSwgZW50aXR5LmJvZHkuR2V0QW5nbGUoKSk7XHJcbiAgICAgICAgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBZXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIlNJREVCQVIuWVwiKX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpLCBpZDogXCJlbnRpdHlfeVwiLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtcclxuICAgICAgICAgIGVudGl0eS5ib2R5LlNldFRyYW5zZm9ybShuZXcgYjJWZWMyKGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3goKSwgdmFsICogMSksIGVudGl0eS5ib2R5LkdldEFuZ2xlKCkpO1xyXG4gICAgICAgIH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gV0lEVEhcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKFwiU0lERUJBUi5XSURUSFwiKX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmdldFdpZHRoKCksIHN0ZXA6IDAuMSwgaWQ6IFwiZW50aXR5X3dpZHRoXCIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgICAgaWYoZW50aXR5Lm5hbWVTdHJpbmcgPT09IFwiQ0lSQ0xFXCIpIHtcclxuICAgICAgICAgICAgZW50aXR5LnJlc2l6ZSh2YWwgLyAyKTtcclxuICAgICAgICAgICAgJChcIiNlbnRpdHlfaGVpZ2h0XCIpLnZhbCh2YWwpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGVudGl0eS5yZXNpemUodmFsIC8gMiwgZW50aXR5LmdldEhlaWdodCgpIC8gMik7XHJcbiAgICAgICAgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBIRUlHSFRcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKFwiU0lERUJBUi5IRUlHSFRcIil9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXROdW1iZXJcIiwgdmFsdWU6IGVudGl0eS5nZXRIZWlnaHQoKSwgc3RlcDogMC4xLCBpZDogXCJlbnRpdHlfaGVpZ2h0XCIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgICAgaWYoZW50aXR5Lm5hbWVTdHJpbmcgPT09IFwiQ0lSQ0xFXCIpIHtcclxuICAgICAgICAgICAgZW50aXR5LnJlc2l6ZSh2YWwgLyAyKTtcclxuICAgICAgICAgICAgJChcIiNlbnRpdHlfd2lkdGhcIikudmFsKHZhbCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZW50aXR5LnJlc2l6ZShlbnRpdHkuZ2V0V2lkdGgoKSAvIDIsIHZhbCAvIDIpO1xyXG4gICAgICAgIH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gUm90YXRpb25cclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKFwiU0lERUJBUi5ST1RBVElPTlwiKX0sXHJcbiAgICAgIHsgdHlwZTogXCJyYW5nZVwiLCBtaW46IDAsIG1heDogMzYwLCBzdGVwOiAxLCB2YWx1ZTogKCgoZW50aXR5LmJvZHkuR2V0QW5nbGUoKSAqIDE4MCAvIE1hdGguUEkpICUgMzYwKSszNjApJTM2MCwgaWQ6IFwiZW50aXR5X3JvdGF0aW9uXCIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5ib2R5LlNldFRyYW5zZm9ybShlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLCAoKHZhbCAqIDEpICogTWF0aC5QSSAvIDE4MCklMzYwKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIEZpeGVkIHJvdGF0aW9uXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIlNJREVCQVIuRklYRURfUk9UQVRJT05cIil9LFxyXG4gICAgICB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogZW50aXR5LmZpeGVkUm90YXRpb24sIG9uY2hhbmdlOiBmdW5jdGlvbih2YWwpIHsgZW50aXR5LmRpc2FibGVSb3RhdGlvbih2YWwpOyB9IH0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBSZXN0aXR1dGlvblxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoXCJTSURFQkFSLlJFU1RJVFVUSU9OXCIpfSxcclxuICAgICAgeyB0eXBlOiBcInJhbmdlXCIsIG1pbjogMCwgbWF4OiAxLCBzdGVwOiAwLjEsIHZhbHVlOiBlbnRpdHkuZml4dHVyZS5HZXRSZXN0aXR1dGlvbigpLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtlbnRpdHkuZml4dHVyZS5TZXRSZXN0aXR1dGlvbih2YWwqMSk7fX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBGcmljdGlvblxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoXCJTSURFQkFSLkZSSUNUSU9OXCIpfSxcclxuICAgICAgeyB0eXBlOiBcInJhbmdlXCIsIG1pbjogMCwgbWF4OiAxLCBzdGVwOiAwLjEsIHZhbHVlOiBlbnRpdHkuZml4dHVyZS5HZXRGcmljdGlvbigpLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtlbnRpdHkuZml4dHVyZS5TZXRGcmljdGlvbih2YWwqMSk7ZW50aXR5LmJvZHkuUmVzZXRNYXNzRGF0YSgpO319LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gRGVuc2l0eVxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoXCJTSURFQkFSLkRFTlNJVFlcIil9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXROdW1iZXJcIiwgdmFsdWU6IGVudGl0eS5maXh0dXJlLkdldERlbnNpdHkoKSwgbWluOiAwLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtlbnRpdHkuZml4dHVyZS5TZXREZW5zaXR5KHZhbCoxKTtlbnRpdHkuYm9keS5SZXNldE1hc3NEYXRhKCk7fX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBDb2xvclxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoXCJTSURFQkFSLkNPTE9SXCIpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0Q29sb3JcIiwgdmFsdWU6IGVudGl0eS5jb2xvciwgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5jb2xvciA9IHZhbH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gQm9keSB0eXBlXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIlNJREVCQVIuQk9EWV9UWVBFXCIpfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwic2VsZWN0XCIsIHNlbGVjdGVkOiBlbnRpdHkuYm9keS5HZXRUeXBlKCksIG9uY2hhbmdlOiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LmJvZHkuU2V0VHlwZSh2YWwgKiAxKX0sXHJcbiAgICAgICAgb3B0aW9uczogW1xyXG4gICAgICAgICAgeyB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoXCJTSURFQkFSLkJPRFlfVFlQRVMuRFlOQU1JQ1wiKSwgdmFsdWU6IEJvZHlUeXBlLkRZTkFNSUNfQk9EWSB9LFxyXG4gICAgICAgICAgeyB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoXCJTSURFQkFSLkJPRFlfVFlQRVMuS0lORU1BVElDXCIpLCB2YWx1ZTogQm9keVR5cGUuS0lORU1BVElDX0JPRFkgfSxcclxuICAgICAgICAgIHsgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKFwiU0lERUJBUi5CT0RZX1RZUEVTLlNUQVRJQ1wiKSwgdmFsdWU6IEJvZHlUeXBlLlNUQVRJQ19CT0RZIH0sXHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgeyB0eXBlOiBcImJ1dHRvblwiLCB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoXCJTSURFQkFSLkRFTEVURV9CVVRUT05cIiksIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZihjb25maXJtKFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkKFwiU0lERUJBUi5ERUxFVEVfQ09ORklSTVwiKSkpXHJcbiAgICAgICAgICBfZW5naW5lLnJlbW92ZUVudGl0eShlbnRpdHkpO1xyXG4gICAgICB9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIHsgdHlwZTogXCJidXR0b25cIiwgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKFwiU0lERUJBUi5TRVRfQkVIQVZJT1JTXCIpLCBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgVUlCdWlsZGVyLnBvcHVwKFVJLmNyZWF0ZUJlaGF2aW9yKGVudGl0eSkpO1xyXG4gICAgICB9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICBdO1xyXG5cclxuICAgIHNpZGViYXJbMF0uYXBwZW5kQ2hpbGQoVUlCdWlsZGVyLmJ1aWxkKHByb3BlcnRpZXMpKTtcclxuICB9LFxyXG5cclxuICBidWlsZEVudGl0eUxpc3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciByZXQgPSBlbChcImRpdi5lbnRpdHlMaXN0XCIpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQ29uc3RhbnRzLkxBWUVSU19OVU1CRVI7IGkrKylcclxuICAgIHtcclxuICAgICAgaWYgKF9lbmdpbmUubGF5ZXJzW2ldLmxlbmd0aCA9PT0gMClcclxuICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgIHZhciBsYXllckVsZW1lbnQgPSBlbChcImRpdi5sYXllclwiLCB7fSwgW1RyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChcIkxBWUVSXCIpLCBcIiBcIiArIChpICsgMSkgKyBcIjpcIl0pO1xyXG5cclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBfZW5naW5lLmxheWVyc1tpXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIHZhciBlbnRpdHkgPSBfZW5naW5lLmxheWVyc1tpXVtqXTtcclxuXHJcbiAgICAgICAgdmFyIGVudGl0eUVsZW1lbnQgPSBlbChcImRpdi5lbnRpdHlcIiwge30sIFtlbChcInNwYW5cIiwge30sIFtcclxuICAgICAgICAgIGVsKFwic3Bhbi5pZFwiLCB7fSwgW2VudGl0eS5pZF0pLCBcIjogXCIsIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZChlbnRpdHkubmFtZVN0cmluZylcclxuICAgICAgICBdKV0pO1xyXG5cclxuICAgICAgICBlbnRpdHlFbGVtZW50Lm9uY2xpY2sgPSAoZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX2VuZ2luZS5zZWxlY3RFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSkoZW50aXR5KTtcclxuXHJcbiAgICAgICAgbGF5ZXJFbGVtZW50LmFwcGVuZENoaWxkKGVudGl0eUVsZW1lbnQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQobGF5ZXJFbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUk7IiwidmFyIFRyYW5zbGF0aW9ucyA9IHJlcXVpcmUoXCIuL3RyYW5zbGF0aW9ucy5qc1wiKTtcclxuXHJcbnZhciBVSUJ1aWxkZXIgPSB7XHJcbiAgcmFkaW86IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwicmFkaW9Hcm91cC1cIiArICQoXCIucmFkaW9Hcm91cFwiKS5sZW5ndGgsXHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJkaXYudWkucmFkaW9Hcm91cFwiLCB7aWQ6IHByb3BlcnRpZXMuaWR9KTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcImlucHV0W3R5cGU9cmFkaW9dXCIsIHRoaXMpLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmRpc2FibGUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoXCJpbnB1dFt0eXBlPXJhZGlvXVwiLCB0aGlzKS5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5lbmFibGUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICB2YXIgaWRDb3VudCA9ICQoXCJpbnB1dFt0eXBlPXJhZGlvXVwiKS5sZW5ndGg7XHJcblxyXG4gICAgcHJvcGVydGllcy5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgZWxlbWVudCA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgICAgaWQ6IFwicmFkaW8tXCIgKyBpZENvdW50KyssXHJcbiAgICAgICAgY2hlY2tlZDogZmFsc2UsXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24oKXt9XHJcbiAgICAgIH0sIGVsZW1lbnQpO1xyXG5cclxuICAgICAgdmFyIGlucHV0ID0gZWwoXCJpbnB1dC51aVwiLCB7dHlwZTogXCJyYWRpb1wiLCBpZDogZWxlbWVudC5pZCwgbmFtZTogcHJvcGVydGllcy5pZH0pO1xyXG4gICAgICB2YXIgbGFiZWwgPSBlbChcImxhYmVsLnVpLmJ1dHRvblwiLCB7Zm9yOiBlbGVtZW50LmlkfSwgW2VsZW1lbnQudGV4dF0pO1xyXG5cclxuICAgICAgaW5wdXQuZW5hYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICQoXCIrbGFiZWxcIiwgdGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlucHV0LmRpc2FibGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAkKFwiK2xhYmVsXCIsIHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBsYWJlbC5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmKCQodGhpcykuaGFzQ2xhc3MoXCJkaXNhYmxlZFwiKSlcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgZWxlbWVudC5vbmNsaWNrKCk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpbnB1dC5jaGVja2VkID0gZWxlbWVudC5jaGVja2VkO1xyXG5cclxuICAgICAgcmV0LmFwcGVuZENoaWxkKGlucHV0KTtcclxuICAgICAgcmV0LmFwcGVuZENoaWxkKGxhYmVsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuICBcclxuICBidXR0b246IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwiYnV0dG9uLVwiICsgJChcIi5idXR0b25cIikubGVuZ3RoLFxyXG4gICAgICBvbmNsaWNrOiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcInNwYW4udWkuYnV0dG9uXCIsIHsgaWQ6IHByb3BlcnRpZXMuaWQgfSwgW3Byb3BlcnRpZXMudGV4dF0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKClcclxuICAgIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5vbmNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcyhcImRpc2FibGVkXCIpKVxyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIHByb3BlcnRpZXMub25jbGljay5jYWxsKHRoaXMsIGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIHNlbGVjdDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJzZWxlY3QtXCIgKyAkKFwic2VsZWN0XCIpLmxlbmd0aCxcclxuICAgICAgc2VsZWN0ZWQ6IFwiXCIsXHJcbiAgICAgIG9uY2hhbmdlOiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcInNlbGVjdC51aVwiLCB7IGlkOiBwcm9wZXJ0aWVzLmlkIH0pO1xyXG5cclxuICAgIHJldC5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcHJvcGVydGllcy5vbmNoYW5nZSh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGVuYWJsZTtcclxuICAgIH07XHJcblxyXG4gICAgcHJvcGVydGllcy5vcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9wdGlvbiwgaW5kZXgpIHtcclxuICAgICAgcmV0LmFwcGVuZENoaWxkKGVsKFwib3B0aW9uXCIsIHt2YWx1ZTogb3B0aW9uLnZhbHVlfSwgW29wdGlvbi50ZXh0XSkpO1xyXG5cclxuICAgICAgaWYgKG9wdGlvbi52YWx1ZSA9PSBwcm9wZXJ0aWVzLnNlbGVjdGVkKVxyXG4gICAgICAgIHJldC5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGJyZWFrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gZWwoXCJzcGFuLnVpLmJyZWFrXCIpO1xyXG4gIH0sXHJcblxyXG4gIGlucHV0VGV4dDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJpbnB1dFRleHQtXCIgKyAkKFwiaW5wdXRbdHlwZT10ZXh0XVwiKS5sZW5ndGgsXHJcbiAgICAgIHZhbHVlOiBcIlwiLFxyXG4gICAgICBvbmlucHV0OiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJ0ZXh0XCIsIGlkOiBwcm9wZXJ0aWVzLmlkLCB2YWx1ZTogcHJvcGVydGllcy52YWx1ZSB9KTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5vbmlucHV0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uaW5wdXQodGhpcy52YWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgaW5wdXROdW1iZXI6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwiaW5wdXROdW1iZXItXCIgKyAkKFwiaW5wdXRbdHlwZT1udW1iZXJdXCIpLmxlbmd0aCxcclxuICAgICAgdmFsdWU6IDAsXHJcbiAgICAgIG1pbjogLUluZmluaXR5LFxyXG4gICAgICBtYXg6IEluZmluaXR5LFxyXG4gICAgICBzdGVwOiAxLFxyXG4gICAgICBvbmlucHV0OiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgaWQ6IHByb3BlcnRpZXMuaWQsIHZhbHVlOiBwcm9wZXJ0aWVzLnZhbHVlLCBtaW46IHByb3BlcnRpZXMubWluLCBtYXg6IHByb3BlcnRpZXMubWF4LCBzdGVwOiBwcm9wZXJ0aWVzLnN0ZXAgfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQub25pbnB1dCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBodG1sOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGNvbnRlbnQ6IFwiXCJcclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHJldHVybiBwcm9wZXJ0aWVzLmNvbnRlbnQ7XHJcbiAgfSxcclxuXHJcbiAgaW5wdXRDb2xvcjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJpbnB1dENvbG9yLVwiICsgJChcImlucHV0W3R5cGU9Y29sb3JdXCIpLmxlbmd0aCxcclxuICAgICAgdmFsdWU6IFwiIzAwMDAwMFwiLFxyXG4gICAgICBvbmlucHV0OiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcImlucHV0LnVpLmJ1dHRvblwiLCB7IHR5cGU6IFwiY29sb3JcIiwgaWQ6IHByb3BlcnRpZXMuaWQsIHZhbHVlOiBwcm9wZXJ0aWVzLnZhbHVlIH0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0Lm9uaW5wdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICByYW5nZTogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJyYW5nZS1cIiArICQoXCJpbnB1dFt0eXBlPXJhbmdlXVwiKS5sZW5ndGgsXHJcbiAgICAgIHZhbHVlOiAwLFxyXG4gICAgICBtaW46IDAsXHJcbiAgICAgIG1heDogMTAsXHJcbiAgICAgIHN0ZXA6IDEsXHJcbiAgICAgIHdpZHRoOiBcIjEwMCVcIixcclxuICAgICAgZGlzYWJsZVdyaXRlOiBmYWxzZSxcclxuICAgICAgb25pbnB1dDogZnVuY3Rpb24oKXt9LFxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHNsaWRlciA9IGVsKFwiaW5wdXQudWlcIiwgeyB0eXBlOiBcInJhbmdlXCIsIG1pbjogcHJvcGVydGllcy5taW4sIG1heDogcHJvcGVydGllcy5tYXgsIHN0ZXA6IHByb3BlcnRpZXMuc3RlcCwgdmFsdWU6IHByb3BlcnRpZXMudmFsdWUsIGlkOiBwcm9wZXJ0aWVzLmlkIH0pO1xyXG4gICAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dE51bWJlcihwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICBpbnB1dC5vbmlucHV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25pbnB1dChpbnB1dC52YWx1ZSk7XHJcbiAgICAgIHNsaWRlci52YWx1ZSA9IGlucHV0LnZhbHVlO1xyXG4gICAgfTtcclxuXHJcbiAgICBzbGlkZXIuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICQoaW5wdXQpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIGlucHV0LmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgc2xpZGVyLmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAkKGlucHV0KS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICBpbnB1dC5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICBzbGlkZXIub25pbnB1dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcHJvcGVydGllcy5vbmlucHV0KHRoaXMudmFsdWUpO1xyXG4gICAgICBpbnB1dC52YWx1ZSA9IHRoaXMudmFsdWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciByZXQgPSBbc2xpZGVyLCBpbnB1dF07XHJcbiAgICBpZiAocHJvcGVydGllcy5kaXNhYmxlV3JpdGUpXHJcbiAgICAgIHJldCA9IFtzbGlkZXJdO1xyXG5cclxuICAgIHJldHVybiBlbChcImRpdi51aS5yYW5nZVwiLCB7c3R5bGU6IFwid2lkdGg6XCIrcHJvcGVydGllcy53aWR0aH0sIHJldCk7XHJcbiAgfSxcclxuXHJcbiAgY2hlY2tib3g6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwiY2hlY2tib3gtXCIgKyAkKFwiaW5wdXRbdHlwZT1jaGVja2JveF1cIikubGVuZ3RoLFxyXG4gICAgICBjaGVja2VkOiBmYWxzZSxcclxuICAgICAgb25jaGFuZ2U6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwic3BhblwiKTtcclxuICAgIHZhciBjaGVja2JveCA9IGVsKFwiaW5wdXQudWlcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGlkOiBwcm9wZXJ0aWVzLmlkIH0pO1xyXG4gICAgdmFyIGxhYmVsID0gZWwoXCJsYWJlbC51aS5idXR0b25cIiwgeyBmb3I6IHByb3BlcnRpZXMuaWQgfSk7XHJcblxyXG4gICAgcmV0LmFwcGVuZENoaWxkKGNoZWNrYm94KTtcclxuICAgIHJldC5hcHBlbmRDaGlsZChsYWJlbCk7XHJcblxyXG4gICAgY2hlY2tib3guZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgY2hlY2tib3guZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKFwiK2xhYmVsXCIsIHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgY2hlY2tib3guY2hlY2tlZCA9IHByb3BlcnRpZXMuY2hlY2tlZDtcclxuXHJcbiAgICBjaGVja2JveC5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcHJvcGVydGllcy5vbmNoYW5nZSh0aGlzLmNoZWNrZWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGJ1aWxkOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgdmFyIHJldCA9IGVsLmRpdigpO1xyXG5cclxuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICB2YXIgZ2VuZXJhdGVkO1xyXG4gICAgICBcclxuICAgICAgc3dpdGNoIChlbGVtZW50LnR5cGUpIHtcclxuICAgICAgICBjYXNlIFwicmFkaW9cIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMucmFkaW8oZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImJ1dHRvblwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5idXR0b24oZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcInNlbGVjdFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5zZWxlY3QoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImlucHV0VGV4dFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5pbnB1dFRleHQoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImlucHV0TnVtYmVyXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmlucHV0TnVtYmVyKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJpbnB1dENvbG9yXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmlucHV0Q29sb3IoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImNoZWNrYm94XCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmNoZWNrYm94KGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJyYW5nZVwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5yYW5nZShlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiaHRtbFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5odG1sKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJicmVha1wiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5icmVhaygpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChnZW5lcmF0ZWQpO1xyXG4gICAgfSwgdGhpcyk7XHJcbiAgICBcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuICBcclxuICBidWlsZExheW91dDogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY29udGVudCA9IGVsKFwiZGl2LnVpLmNvbnRlbnQucGFuZWxcIik7XHJcbiAgICB2YXIgc2lkZWJhciA9IGVsKFwiZGl2LnVpLnNpZGViYXIucGFuZWxcIiwge30sIFsgZWwoXCJkaXYuY29udGVudFwiKSBdKTtcclxuICAgIHZhciByZXNpemVyID0gZWwoXCJkaXYudWkucmVzaXplclwiKTtcclxuICAgIHZhciB0b29sYmFyID0gZWwoXCJkaXYudWkudG9vbGJhclwiKTtcclxuXHJcbiAgICB2YXIgdyA9ICQoXCJib2R5XCIpLm91dGVyV2lkdGgoKTtcclxuICAgIHZhciBzaWRlYmFyV2lkdGggPSAyNTA7XHJcblxyXG4gICAgY29udGVudC5zdHlsZS53aWR0aCA9IHcgLSAyNTAgKyBcInB4XCI7XHJcbiAgICBzaWRlYmFyLnN0eWxlLndpZHRoID0gc2lkZWJhcldpZHRoICsgXCJweFwiO1xyXG5cclxuICAgIHZhciBzaWRlYmFyUmVzaXplRXZlbnQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB2YXIgd2luZG93V2lkdGggPSAkKFwiYm9keVwiKS5vdXRlcldpZHRoKCk7XHJcbiAgICAgIHZhciBzaWRlYmFyV2lkdGggPSBNYXRoLm1heCgzMCwgTWF0aC5taW4od2luZG93V2lkdGggKiAwLjYsIHdpbmRvd1dpZHRoIC0gZS5jbGllbnRYKSk7XHJcbiAgICAgIHZhciBjb250ZW50V2lkdGggPSB3aW5kb3dXaWR0aCAtIHNpZGViYXJXaWR0aDtcclxuXHJcbiAgICAgIHNpZGViYXIuc3R5bGUud2lkdGggPSBzaWRlYmFyV2lkdGggKyBcInB4XCI7XHJcbiAgICAgIGNvbnRlbnQuc3R5bGUud2lkdGggPSBjb250ZW50V2lkdGggKyBcInB4XCI7XHJcblxyXG4gICAgICB3aW5kb3cub25yZXNpemUoKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIG1vdXNlVXBFdmVudCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHNpZGViYXIucmVzaXppbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICQoXCIucmVzaXplci51aVwiKS5yZW1vdmVDbGFzcyhcInJlc2l6aW5nXCIpO1xyXG5cclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2lkZWJhclJlc2l6ZUV2ZW50KTtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG1vdXNlVXBFdmVudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciB3aW5kb3dSZXNpemVFdmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHdpbmRvd1dpZHRoID0gJChcImJvZHlcIikub3V0ZXJXaWR0aCgpO1xyXG4gICAgICB2YXIgY29udGVudFdpZHRoID0gTWF0aC5tYXgod2luZG93V2lkdGggKiAwLjQsIE1hdGgubWluKFxyXG4gICAgICAgIHdpbmRvd1dpZHRoIC0gMzAsXHJcbiAgICAgICAgd2luZG93V2lkdGggLSAkKFwiLnNpZGViYXIudWlcIikub3V0ZXJXaWR0aCgpXHJcbiAgICAgICkpO1xyXG4gICAgICB2YXIgc2lkZWJhcldpZHRoID0gd2luZG93V2lkdGggLSBjb250ZW50V2lkdGg7XHJcblxyXG4gICAgICBzaWRlYmFyLnN0eWxlLndpZHRoID0gc2lkZWJhcldpZHRoICsgXCJweFwiO1xyXG4gICAgICBjb250ZW50LnN0eWxlLndpZHRoID0gY29udGVudFdpZHRoICsgXCJweFwiO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXNpemVyLm9ubW91c2Vkb3duID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgc2lkZWJhci5yZXNpemluZyA9IHRydWU7XHJcblxyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwicmVzaXppbmdcIik7XHJcblxyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBzaWRlYmFyUmVzaXplRXZlbnQpO1xyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbW91c2VVcEV2ZW50KTtcclxuICAgIH07XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgd2luZG93UmVzaXplRXZlbnQpO1xyXG5cclxuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQodG9vbGJhcik7XHJcbiAgICBzaWRlYmFyLmFwcGVuZENoaWxkKHJlc2l6ZXIpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250ZW50KTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2lkZWJhcik7XHJcbiAgfSxcclxuXHJcbiAgLy8gQ3JlYXRpbmcgYSBwb3B1cCBtZXNzYWdlXHJcbiAgcG9wdXA6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIHZhciBvdmVybGF5ID0gZWwoXCJkaXYjcG9wdXBPdmVybGF5XCIsIFtlbChcImRpdiNwb3B1cENvbnRlbnRcIiwgW2RhdGFdKV0pO1xyXG4gICAgb3ZlcmxheS5vbmNsaWNrID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICBVSUJ1aWxkZXIuY2xvc2VQb3B1cChlKTtcclxuICAgIH07XHJcblxyXG4gICAgZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUob3ZlcmxheSwgZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcclxuXHJcbiAgICBUcmFuc2xhdGlvbnMucmVmcmVzaCgpO1xyXG4gIH0sXHJcblxyXG4gIC8vIENsb3NpbmcgYSBwb3B1cCBtZXNzYWdlXHJcbiAgY2xvc2VQb3B1cDogZnVuY3Rpb24oZSkge1xyXG4gICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBvcHVwT3ZlcmxheVwiKTtcclxuICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3B1cENvbnRlbnRcIik7XHJcblxyXG4gICAgLy8gTWFrZSBzdXJlIGl0IHdhcyB0aGUgb3ZlcmxheSB0aGF0IHdhcyBjbGlja2VkLCBub3QgYW4gZWxlbWVudCBhYm92ZSBpdFxyXG4gICAgaWYgKHR5cGVvZiBlICE9PSBcInVuZGVmaW5lZFwiICYmIGUudGFyZ2V0ICE9PSBvdmVybGF5KVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICBjb250ZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY29udGVudCk7XHJcbiAgICBvdmVybGF5LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3ZlcmxheSk7XHJcbiAgfSxcclxuXHJcblxyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUlCdWlsZGVyOyIsIi8vIE9iamVjdCBjb250YWluaW5nIHVzZWZ1bCBtZXRob2RzXHJcbnZhciBVdGlscyA9IHtcclxuICBnZXRCcm93c2VyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICQoXCIudWkuY29udGVudFwiKS5vdXRlcldpZHRoKCk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0QnJvd3NlckhlaWdodDogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJChcIi51aS5jb250ZW50XCIpLm91dGVySGVpZ2h0KCkgLSAkKFwiLnVpLnRvb2xiYXJcIikub3V0ZXJIZWlnaHQoKTtcclxuICB9LFxyXG5cclxuICByYW5kb21SYW5nZTogZnVuY3Rpb24obWluLCBtYXgpIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbik7XHJcbiAgfSxcclxuXHJcbn07XHJcblxyXG5BcnJheS5wcm90b3R5cGUuZXF1YWxUbyA9IGZ1bmN0aW9uIChiKSB7XHJcbiAgaWYgKHRoaXMubGVuZ3RoICE9IGIubGVuZ3RoKVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmICh0aGlzW2ldLmVxdWFsVG8pIHtcclxuICAgICAgaWYgKCF0aGlzW2ldLmVxdWFsVG8oYltpXSkpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGVsc2UgaWYgKHRoaXNbaV0gIT09IGJbaV0pXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuQXJyYXkucHJvdG90eXBlLmVxdWFsSW5kZXhPZiA9IGZ1bmN0aW9uIChuZWVkbGUpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmICh0aGlzW2ldID09PSBuZWVkbGUpXHJcbiAgICAgIHJldHVybiBpO1xyXG5cclxuICAgIGlmIChBcnJheS5pc0FycmF5KG5lZWRsZSkgJiYgQXJyYXkuaXNBcnJheSh0aGlzW2ldKSAmJiB0aGlzW2ldLmVxdWFsVG8obmVlZGxlKSlcclxuICAgICAgcmV0dXJuIGk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gLTE7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxzOyIsInZhciBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzLmpzXCIpO1xyXG52YXIgQ29uc3RhbnRzID0gcmVxdWlyZShcIi4vY29uc3RhbnRzLmpzXCIpO1xyXG5cclxuLy8gVklFV1BPUlRcclxuLy8gVGhpcyBpcyBiYXNpY2FsbHkgY2FtZXJhICsgcHJvamVjdG9yXHJcblxyXG52YXIgVmlld3BvcnQgPSBmdW5jdGlvbiAoY2FudmFzRWxlbWVudCwgd2lkdGgsIGhlaWdodCwgeCwgeSkge1xyXG4gIHRoaXMuc2NhbGUgPSBDb25zdGFudHMuREVGQVVMVF9TQ0FMRTtcclxuXHJcbiAgLy8gQ2FudmFzIGRpbWVuc2lvbnNcclxuICBpZiAod2lkdGggIT0gdW5kZWZpbmVkICYmIGhlaWdodCAhPSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMuc2V0QXV0b1Jlc2l6ZShmYWxzZSk7XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5zZXRBdXRvUmVzaXplKHRydWUpO1xyXG4gICAgdGhpcy5hdXRvUmVzaXplKCk7XHJcbiAgfVxyXG5cclxuICAvLyBDZW50ZXIgcG9pbnQgb2YgdGhlIGNhbWVyYVxyXG4gIGlmICh4ICE9PSB1bmRlZmluZWQgJiYgeSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy54ID0gMDtcclxuICAgIHRoaXMueSA9IDA7XHJcbiAgfVxyXG5cclxuICAvLyBDYW52YXMgZWxlbWVudFxyXG4gIHRoaXMuY2FudmFzRWxlbWVudCA9IGNhbnZhc0VsZW1lbnQ7XHJcblxyXG4gIGlmIChjYW52YXNFbGVtZW50ID09PSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMuY2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzRWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICB0aGlzLnJlc2V0RWxlbWVudCgpOyAvLyBSZXNpemUgdG8gbmV3IGRpbWVuc2lvbnNcclxuXHJcbiAgdGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXNFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcclxufTtcclxuXHJcbi8vIFJlbG9hZHMgdmFsdWVzIGZvciB0aGUgY2FudmFzIGVsZW1lbnRcclxuVmlld3BvcnQucHJvdG90eXBlLnJlc2V0RWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLmNhbnZhc0VsZW1lbnQud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gIHRoaXMuY2FudmFzRWxlbWVudC5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxufTtcclxuXHJcbi8vIEF1dG9tYXRpY2FsbHkgcmVzaXplcyB0aGUgdmlld3BvcnQgdG8gZmlsbCB0aGUgc2NyZWVuXHJcblZpZXdwb3J0LnByb3RvdHlwZS5hdXRvUmVzaXplID0gZnVuY3Rpb24gKCkge1xyXG4gIHRoaXMud2lkdGggPSBVdGlscy5nZXRCcm93c2VyV2lkdGgoKTtcclxuICB0aGlzLmhlaWdodCA9IFV0aWxzLmdldEJyb3dzZXJIZWlnaHQoKTtcclxufTtcclxuXHJcbi8vIFRvZ2dsZXMgdmlld3BvcnQgYXV0byByZXNpemluZ1xyXG5WaWV3cG9ydC5wcm90b3R5cGUuc2V0QXV0b1Jlc2l6ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG5cclxuICB0aGlzLmF1dG9SZXNpemVBY3RpdmUgPSB2YWx1ZTtcclxuXHJcbiAgaWYgKHRoaXMuYXV0b1Jlc2l6ZUFjdGl2ZSkge1xyXG4gICAgdmFyIHQgPSB0aGlzO1xyXG4gICAgd2luZG93Lm9ucmVzaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB0LmF1dG9SZXNpemUoKTtcclxuICAgICAgdC5yZXNldEVsZW1lbnQoKTtcclxuICAgIH07XHJcbiAgfSBlbHNlIHtcclxuICAgIHdpbmRvdy5vbnJlc2l6ZSA9IG51bGw7XHJcbiAgfVxyXG59O1xyXG5cclxuVmlld3BvcnQucHJvdG90eXBlLnpvb20gPSBmdW5jdGlvbiAodmFsKSB7XHJcbiAgdmFyIGEgPSAxLjU7XHJcbiAgdGhpcy5zY2FsZSA9IChDb25zdGFudHMuREVGQVVMVF9TQ0FMRSAvIE1hdGgucG93KGEsIDYpKSAqIE1hdGgucG93KGEsIDEyIC0gdmFsKTtcclxuXHJcbiAgaWYoX2VuZ2luZS5zZWxlY3RlZEVudGl0eSlcclxuICAgIF9lbmdpbmUuc2VsZWN0ZWRFbnRpdHkucmVjYWxjdWxhdGVIZWxwZXJzKCk7XHJcbn07XHJcblxyXG5WaWV3cG9ydC5wcm90b3R5cGUuZ2V0T2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiBbdGhpcy54IC0gdGhpcy53aWR0aCAvIDIsIHRoaXMueSAtIHRoaXMuaGVpZ2h0IC8gMl07XHJcbn07XHJcblxyXG5WaWV3cG9ydC5wcm90b3R5cGUudG9TY2FsZSA9IGZ1bmN0aW9uIChudW1iZXIpIHtcclxuICByZXR1cm4gbnVtYmVyICogdGhpcy5zY2FsZTtcclxufTtcclxuXHJcblZpZXdwb3J0LnByb3RvdHlwZS5mcm9tU2NhbGUgPSBmdW5jdGlvbiAobnVtYmVyKSB7XHJcbiAgcmV0dXJuIG51bWJlciAvIHRoaXMuc2NhbGU7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdwb3J0OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIExBTkdVQUdFX05BTUU6IFwiRW5nbGlzaFwiLFxyXG4gIENPTExJU0lPTl9HUk9VUFM6IFwiQ29sbGlzaW9uIGdyb3Vwc1wiLFxyXG4gIFNUQVJUOiBcIlN0YXJ0XCIsXHJcbiAgUEFVU0U6IFwiUGF1c2VcIixcclxuICBMQVlFUjogXCJMYXllciBcIixcclxuICBaT09NOiBcIlpvb206IFwiLFxyXG5cclxuICBUT09MOiBcIlRvb2w6IFwiLFxyXG4gIFJFQ1RBTkdMRTogXCJSZWN0YW5nbGVcIixcclxuICBDSVJDTEU6IFwiQ2lyY2xlXCIsXHJcblxyXG4gIEJFSEFWSU9SUzoge1xyXG4gICAgQ09ORElUSU9OOiBcIldoZW4gdGhlIGZvbGxvd2luZyBjb25kaXRvbiBpcyBtZXQ6XCIsXHJcbiAgICBJTlBVVF9ESUFMT0c6IFwiSW5zZXJ0IGEgY29ycmVjdCB2YWx1ZSBmb3IgXCIsXHJcbiAgICBBQ1RJT046IFwiRG8gdGhpczpcIixcclxuICAgIEFOT1RIRVJfQUNUSU9OOiBcIkFuZCB0aGlzOlwiLFxyXG4gICAgTkVXX0FDVElPTjogXCJBZGQgbmV3IGFjdGlvblwiLFxyXG4gICAgTkVXX0JFSEFWSU9SOiBcIkFkZCBuZXcgYmVoYXZpb3JcIixcclxuICAgIFJFTU9WRV9BQ1RJT046IFwiUmVtb3ZlIGFjdGlvblwiLFxyXG4gICAgUkVNT1ZFX0JFSEFWSU9SOiBcIlJlbW92ZSBiZWhhdmlvclwiLFxyXG4gICAgRE9ORV9CVVRUT046IFwiRG9uZVwiLFxyXG4gICAgQ0FOQ0VMX0JVVFRPTjogXCJDYW5jZWxcIixcclxuICB9LFxyXG5cclxuICBTSURFQkFSOiB7XHJcbiAgICBJRDogXCJJRDpcIixcclxuICAgIENPTExJU0lPTl9HUk9VUDogXCJDb2xsaXNpb24gZ3JvdXA6XCIsXHJcbiAgICBYOiBcIlgtYXhpcyBwb3NpdGlvbjpcIixcclxuICAgIFk6IFwiWS1heGlzIHBvc2l0aW9uOlwiLFxyXG4gICAgV0lEVEg6IFwiV2lkdGg6XCIsXHJcbiAgICBIRUlHSFQ6IFwiSGVpZ2h0OlwiLFxyXG4gICAgUk9UQVRJT046IFwiUm90YXRpb246XCIsXHJcbiAgICBGSVhFRF9ST1RBVElPTjogXCJGaXhlZCByb3RhdGlvbjpcIixcclxuICAgIFJFU1RJVFVUSU9OOiBcIlJlc3RpdHV0aW9uOlwiLFxyXG4gICAgRlJJQ1RJT046IFwiRnJpY3Rpb246XCIsXHJcbiAgICBERU5TSVRZOiBcIkRlbnNpdHk6XCIsXHJcbiAgICBDT0xPUjogXCJDb2xvcjpcIixcclxuICAgIExBWUVSOiBcIkxheWVyOlwiLFxyXG4gICAgREVMRVRFX0JVVFRPTjogXCJEZWxldGUgb2JqZWN0XCIsXHJcbiAgICBERUxFVEVfQ09ORklSTTogXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgb2JqZWN0P1wiLFxyXG4gICAgU0VUX0JFSEFWSU9SUzogXCJTZXQgYmVoYXZpb3JcIixcclxuXHJcbiAgICBCT0RZX1RZUEU6IFwiQm9keSB0eXBlOlwiLFxyXG4gICAgQk9EWV9UWVBFUzoge1xyXG4gICAgICBEWU5BTUlDOiBcIkR5bmFtaWNcIixcclxuICAgICAgU1RBVElDOiBcIlN0YXRpY1wiLFxyXG4gICAgICBLSU5FTUFUSUM6IFwiS2luZW1hdGljXCIsXHJcbiAgICB9LFxyXG4gIH1cclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBMQU5HVUFHRV9OQU1FOiBcIlNsb3ZlbnNreVwiLFxyXG4gIENPTExJU0lPTl9HUk9VUFM6IFwiU2t1cGlueSBwcmUga29sw616aWVcIixcclxuICBTVEFSVDogXCLFoHRhcnRcIixcclxuICBQQVVTRTogXCJQYXV6YVwiLFxyXG4gIExBWUVSOiBcIlZyc3R2YSBcIixcclxuICBaT09NOiBcIlByaWJsw63FvmVuaWU6IFwiLFxyXG5cclxuICBUT09MOiBcIk7DoXN0cm9qOiBcIixcclxuICBSRUNUQU5HTEU6IFwiT2JkxLrFvm5pa1wiLFxyXG4gIENJUkNMRTogXCJLcnVoXCIsXHJcblxyXG4gIEJFSEFWSU9SUzoge1xyXG4gICAgQ09ORElUSU9OOiBcIktlxI8gcGxhdMOtIG5hc2xlZHVqw7pjYSBwb2RtaWVua2E6XCIsXHJcbiAgICBJTlBVVF9ESUFMT0c6IFwiWmFkYWp0ZSBrb3Jla3Ruw7ogaG9kbm90dSBwcmUgXCIsXHJcbiAgICBBQ1RJT046IFwiU3ByYXYgdG90bzpcIixcclxuICAgIEFOT1RIRVJfQUNUSU9OOiBcIkEgdG90bzpcIixcclxuICAgIE5FV19BQ1RJT046IFwiUHJpZGHFpSBub3bDuiBha2NpdVwiLFxyXG4gICAgTkVXX0JFSEFWSU9SOiBcIlByaWRhxaUgbm92w7ogcG9kbWllbmt1XCIsXHJcbiAgICBSRU1PVkVfQUNUSU9OOiBcIk9kc3Ryw6FuacWlIGFrY2l1XCIsXHJcbiAgICBSRU1PVkVfQkVIQVZJT1I6IFwiT2RzdHLDoW5pxaUgcG9kbWllbmt1XCIsXHJcbiAgICBET05FX0JVVFRPTjogXCJIb3Rvdm9cIixcclxuICAgIENBTkNFTF9CVVRUT046IFwiWnJ1xaFpxaVcIixcclxuICB9LFxyXG5cclxuICBTSURFQkFSOiB7XHJcbiAgICBJRDogXCJJRDpcIixcclxuICAgIENPTExJU0lPTl9HUk9VUDogXCJTa3VwaW5hIHByZSBrb2zDrXppZTpcIixcclxuICAgIFg6IFwiUG96w61jaWEgbmEgb3NpIFg6XCIsXHJcbiAgICBZOiBcIlBvesOtY2lhIG5hIG9zaSBZOlwiLFxyXG4gICAgV0lEVEg6IFwixaDDrXJrYTpcIixcclxuICAgIEhFSUdIVDogXCJWw73FoWthOlwiLFxyXG4gICAgUk9UQVRJT046IFwiUm90w6FjaWE6XCIsXHJcbiAgICBGSVhFRF9ST1RBVElPTjogXCJGaXhuw6Egcm90w6FjaWE6XCIsXHJcbiAgICBSRVNUSVRVVElPTjogXCJQcnXFvm5vc8WlOlwiLFxyXG4gICAgRlJJQ1RJT046IFwiVHJlbmllOlwiLFxyXG4gICAgREVOU0lUWTogXCJIdXN0b3RhOlwiLFxyXG4gICAgQ09MT1I6IFwiRmFyYmE6XCIsXHJcbiAgICBMQVlFUjogXCJWcnN0dmE6XCIsXHJcbiAgICBERUxFVEVfQlVUVE9OOiBcIk9kc3Ryw6FuacWlIG9iamVrdFwiLFxyXG4gICAgREVMRVRFX0NPTkZJUk06IFwiTmFvemFqIGNoY2V0ZSBvZHN0csOhbmnFpSB0ZW50byBvYmpla3Q/XCIsXHJcbiAgICBTRVRfQkVIQVZJT1JTOiBcIk5hc3RhdmnFpSBzcHLDoXZhbmllXCIsXHJcblxyXG4gICAgQk9EWV9UWVBFOiBcIkRydWggdGVsZXNhOlwiLFxyXG4gICAgQk9EWV9UWVBFUzoge1xyXG4gICAgICBEWU5BTUlDOiBcIkR5bmFtaWNrw6lcIixcclxuICAgICAgU1RBVElDOiBcIlN0YXRpY2vDqVwiLFxyXG4gICAgICBLSU5FTUFUSUM6IFwiS2luZW1hdGlja8OpXCIsXHJcbiAgICB9LFxyXG4gIH1cclxufTsiXX0=