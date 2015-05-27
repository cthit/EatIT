OrderItems = new Mongo.Collection("order_items");
Orders = new Mongo.Collection("orders");

function randomHash() {
  var hex = parseInt(Math.random() * 0xfff).toString(16);
  return ("000" + hex).slice(-3); // pad with 3 zeros
}

if (Meteor.isClient) {
  var hash = window.location.hash;

  Meteor.subscribe('orders', function() {
    var order, error = false;

    if (hash) {
      hash = hash.substring(1).toLowerCase();
    }

    order = Orders.findOne({'hash': hash});
    if (hash && !order) {
      error = true;
    }
    Session.set('error', error);

    if (!order && !error) {
      console.log('Creating new order!');
      do {
        hash = randomHash();
        order = Orders.findOne({'hash': hash});
      } while (order !== undefined);
      var id = Orders.insert({
        'hash': hash,
        createdAt: new Date()
      });
      order = Orders.findOne({'hash': hash});
      window.location.hash = hash;
    }
    if (order) {
      Session.set('order', order._id);
      Session.set('url', window.location.href);
    }
  });
  Session.set('url', window.location.href);

  Template.body.helpers({
    url: function() {
      return Session.get('url');
    },
    items: function () {
      var items = OrderItems.find({order: Session.get('order')}).fetch();
      var pizzas = {};
      _.each(items, function(item) {
        if (!pizzas[item.pizza]) {
          pizzas[item.pizza] = {count: 0, items: []};
        }

        pizzas[item.pizza].count++;
        pizzas[item.pizza].items.push({nick: item.nick, id: item._id});

      });
      return _.map(pizzas, function(value, key) {
        value.name = key;
        return value;
      });
    },
    error: function() {
      return Session.get('error');
    },
    timer_started: timer_started
  });

  Template.body.events({
    "submit .new-pizza": function (event) {
      var pizza = event.target,
          pizzaName = pizza.pizza.value.trim(),
          nick = pizza.nick.value.trim();
          // comment = pizza.comment.value.trim();
      if (!pizzaName || !nick) {
        return false;
      }
      OrderItems.insert({
        order: Session.get('order'),
        pizza: pizza.pizza.value.trim(),
        nick: pizza.nick.value.trim(),
        // comment: pizza.comment.value.trim(),
        createdAt: new Date()
      });
      pizza.pizza.value = '';
      // pizza.nick.value = '';
      // pizza.comment.value = '';

      return false;
    },
    "click .pizza-item .name": function(event) {
      var name = $(event.target).data('name');
      $('.new-pizza [name="pizza"]').val(name).next().focus();
    },
    "click .pizza-item small.deletable": function(event) {
      var id = $(event.target).data('id');
      OrderItems.remove({_id: id});
    }
  });
  function time_left() {
    var date = new Date();
    var order = Orders.findOne(Session.get('order'));
    var seconds = parseInt((order.timer_end - date) / 1000);
    var mins = parseInt(seconds / 60);
    seconds = seconds % 60;
    return [mins, seconds];
  }
  function timer_started() {
      var order = Orders.findOne(Session.get('order'));
      return Boolean(order && order.timer_end);
  }
  function format_time(time) {
    var prefix = '';
    if (time[1] < 0) {
      prefix = '-';
    }
    time[0] = Math.abs(time[0]);
    time[1] = Math.abs(time[1]);
    if (time[1] < 10) {
        time[1] = '0' + time[1];
    }
    if (isNaN(time[0])) {
      return '';
    }

    return prefix + time.join(':');
  }
  Template.pizza.helpers({
    classname: function() {
      return timer_started() ? '' : 'deletable';
    }
  });
  Template.timer.created = function() {
    this.handle = Meteor.setInterval(function() {
      var time = time_left();
      if (time[0] === 0 && time[1] === 0 || (time[1] < 0 && !window.playing)) {
        if (player && player.getPlayerState() === YT.PlayerState.CUED) {
          console.log('stop!');
          document.body.className += ' animated';
          window.playing = true;
          player.seekTo(51);
        }
        // Meteor.clearInterval(this.handle);
      }
      Session.set('time_left', format_time(time));
    }.bind(this), 500);
  };
  Template.timer.helpers({
    display_time: function() {
      return Session.get('time_left');
    },
    timer_started: timer_started
  });
  Template.timer.events({
    "submit .start-timer": function(event) {
      var mins = parseInt(event.target.minutes.value.trim());
      var end_date = (new Date()).valueOf() + mins * 60000;
      Orders.update(Session.get('order'), { $set: {timer_end: end_date}})
      return false;
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.publish('orders', function() {
      return Orders.find();
    });
    Meteor.publish('order_items', function() {
      return OrderItems.find();
    });
    Meteor.setInterval(function() {
      var time = new Date() - 10800000; // 3 hours
      Orders.remove({createdAt: { $lt: time }});
      OrderItems.remove({createdAt: { $lt: time }});
    }, 600000); // every 10th minute
  });
}
