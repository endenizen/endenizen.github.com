$(function() {
  $('#danceability').slider({
    range: true,
    min: 0.0,
    max: 1.0,
    step: 0.1,
    values: [0.0, 1.0]
  });
  $('#search').click(function() {
    var params = {
      min_danceability: $('#danceability').slider('values', 0),
      max_danceability: $('#danceability').slider('values', 1)
    };
    echo.search(params);
    return false;
  });
});

function log() {
  if(console && console.log) {
    console.log.apply(console, arguments);
  }
}

function Echo() {
  this.apiKey = "HI60IQAWDGBI3OO35";
  this.baseUrl = "http://developer.echonest.com/api/v4/";
}

Echo.prototype.apiCall = function(type, method, params, callback) {
  var url = [
    this.baseUrl,
    type + '/' + method,
    '?api_key=' + this.apiKey,
    '&format=jsonp',
    '&bucket=id:rdio-us-streaming',
    '&limit=true'
  ].join('');

  $.each(params, function(key, val) {
    url += '&' + key + '=' + val;
  });

  $.ajax({
    url: url,
    dataType: 'jsonp',
    success: callback,
    cache: true
  });
};

Echo.prototype.search = function(params) {
  var self = this;

  this.apiCall('song', 'search', params, function(result) {
    var list = $('#song_holder');
    list.empty();

    log(result);

    $.each(result.response.songs, function() {
      var song = $('<li></li>').data('obj', this);
      song.text(this.title + ' by ' + this.artist_name);
      song.click(self.playMe);
      list.append(song);
    });
  });
};

Echo.prototype.playMe = function() {
  var rdioId = $(this).data('obj').foreign_ids[0].foreign_id.split(':')[2];
  rdio.play(rdioId);
};

function Rdio() {
  var token = "GAlNwZcE_____3IyZWI3djNweXltOXZjY2pmcGtnYXpwcmxvY2FsaG9zdLxCDkEq2VNS7Y3-WVyyS8Y=",
    domain = "localhost",
    listener = "rdio_callback",

    flashvars = {},

    params = {
      'allowScriptAccess': 'always'
    },

    attributes = {};

  /* set correct token if in "production" */
  if(document.location.host == 'endenizen.github.com') {
    token = "GBRNwZoo_____3IyZWI3djNweXltOXZjY2pmcGtnYXpwcmVuZGVuaXplbi5naXRodWIuY29tfql1sdhneK-WcnHMs9qjcw==";
    domain = 'endenizen.github.com';
  }

  flashvars = {
    'playbackToken': token,
    'domain': domain,
    'listener': listener
  };

  swfobject.embedSWF('http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
    'apiswf', // the ID of the element that will be replaced with the SWF
    1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);
}

Rdio.prototype.ready = function() {
  this.player = $('#apiswf')[0];
};

Rdio.prototype.play = function(key) {
  log('playing ' + key);
  this.player.rdio_play(key);
};

var rdio_callback = {
  ready: function() {
    log('player ready');
    rdio.ready();
  },
  
  playStateChanged: function(playState) {
    // The playback state has changed.
    // The state can be: 0 - paused, 1 - playing, 2 - stopped, 3 - buffering or 4 - paused.
    log('playstate changed ' + playState);
    //$('#playState').text(playState);
  },

  playingTrackChanged: function(playingTrack, sourcePosition) {
    // The currently playing track has changed.
    // Track metadata is provided as playingTrack and the position within the playing source as sourcePosition.
    log('playingTrackChanged',arguments);
    if (playingTrack != null) {
      //$('#track').text(playingTrack['name']);
      //$('#album').text(playingTrack['album']);
      //$('#artist').text(playingTrack['artist']);
      //$('#art').attr('src', playingTrack['icon']);
    }
  },
  playingSourceChanged: function(playingSource) {
    // The currently playing source changed.
    // The source metadata, including a track listing is inside playingSource.
    log('playingSourceChanged',arguments);
  },

  volumeChanged: function(volume) {
    // The volume changed to volume, a number between 0 and 1.
    log('volumeChanged',arguments);
  },

  muteChanged: function(mute) {
    // Mute was changed. mute will either be true (for muting enabled) or false (for muting disabled).
    log('muteChanged',arguments);
  },

  positionChanged: function(position) {
    //The position within the track changed to position seconds.
    // This happens both in response to a seek and during playback.
    //$('#position').text(position);
    log('positionChanged',arguments);
  },

  queueChanged: function(newQueue) {
    // The queue has changed to newQueue.
    log('queueChanged',arguments);
  },

  shuffleChanged: function(shuffle) {
    // The shuffle mode has changed.
    // shuffle is a boolean, true for shuffle, false for normal playback order.
    log('shuffleChanged',arguments);
  },

  repeatChanged: function(repeatMode) {
    // The repeat mode change.
    // repeatMode will be one of: 0: no-repeat, 1: track-repeat or 2: whole-source-repeat.
    log('repeatChanged',arguments);
  },

  playingSomewhereElse: function() {
    // An Rdio user can only play from one location at a time.
    // If playback begins somewhere else then playback will stop and this callback will be called.
    log('playingSomewhereElse',arguments);
  },
  
};

var echo = new Echo();
var rdio = new Rdio();

