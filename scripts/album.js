var createSongRow = function (songNumber, songName, songLength) {
     var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
	  + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
      + '</tr>' 
      ;
 
	var $row = $(template);
	
	var clickHandler = function() {
		var songNumber = parseInt($(this).attr('data-song-number'));

	if (currentlyPlayingSongNumber !== null) {
		var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);	currentlyPlayingCell.html(currentlyPlayingSongNumber);
		
	}
	if (currentlyPlayingSongNumber !== songNumber) {
		$(this).html(pauseButtonTemplate);
		setSong(songNumber);
		currentSoundFile.play();
		updatePlayerBarSong();
		updateSeekBarWhileSongPlays();
	} else if (currentlyPlayingSongNumber === songNumber) {
		if (currentSoundFile.isPaused()){
			$(this).html(pauseButtonTemplate);
			$('.main-controls .play-pause').html(playerBarPauseButton);
			currentSoundFile.play();
		} else {
			$(this).html(playButtonTemplate);
			$('.main-controls .play-pause').html(playerBarPlayButton);
			currentSoundFile.pause();	
		}
	}
};
	
	var onHover = function(event) {
		var songItemRow = $(this).find('.song-item-number');
		var songNumber = parseInt(songItemRow.attr('data-song-number'));
		
		if (songNumber !== currentlyPlayingSongNumber) {
			songItemRow.html(playButtonTemplate);
		}
	};
	
	var offHover = function(event){
		console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
		var songItemRow = $(this).find('.song-item-number');
		var songNumber = parseInt(songItemRow.attr('data-song-number')); 
		
		if (songNumber !== currentlyPlayingSongNumber) {
			songItemRow.html(songNumber);
		}		
	};
	
	$row.find('.song-item-number').click(clickHandler);
	$row.hover(onHover, offHover);
	
	return $row;
 };

var setCurrentAlbum = function(album) {
	currentAlbum = album;
     var $albumTitle = $('.album-view-title');
     var $albumArtist = $('.album-view-artist');
     var $albumReleaseInfo = $('.album-view-release-info');
     var $albumImage = $('.album-cover-art');
     var $albumSongList = $('.album-view-song-list');
 
     $albumTitle.text(album.title);
     $albumArtist.text(album.artist);
     $albumReleaseInfo.text(album.year + ' ' + album.label);
     $albumImage.attr('src', album.albumArtUrl);
 
     $albumSongList.empty();
 
     for (var i = 0; i < album.songs.length; i++) {
         var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
         $albumSongList.append($newRow);
     }
 };

var updateSeekBarWhileSongPlays = function() {
     if (currentSoundFile) {
         currentSoundFile.bind('timeupdate', function(event) {
             var seekBarFillRatio = this.getTime() / this.getDuration();
             var $seekBar = $('.seek-control .seek-bar');
 
             updateSeekPercentage($seekBar, seekBarFillRatio);
			 setCurrentTimeinPlayerBar(this.getTime());
			
         });
     }
 };

var setCurrentTimeinPlayerBar = function(currentTime){
	$('.current-time').text(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function(totalTime){
	$('.currently-playing .total-time').text(filterTimeCode(totalTime));	
};

var filterTimeCode = function(timeInSeconds){
	var totalSeconds = parseFloat(timeInSeconds);
	var minutes = Math.floor(totalSeconds / 60);
	var seconds = parseFloat(Math.floor(totalSeconds % 60));
	if (seconds < 10)  {
		return minutes + ":0" + seconds;
	}
	return minutes + ":" + seconds;
};

var updateSeekPercentage = function ($seekBar, seekBarFillRatio) {
	var offsetXPercent = seekBarFillRatio * 100;
	offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});	
	
};

var setupSeekBars = function() {
	var $seekBars = $('.player-bar .seek-bar');
	
	$seekBars.click(function(event) {
		
		var offsetX = event.pageX - $(this).offset().left;
		var barWidth = $(this).width();
		var seekBarFillRatio = offsetX / barWidth;
		updateSeekPercentage($(this), seekBarFillRatio);
		seek(seekBarFillRatio);
	});
	$seekBars.find('.thumb').mousedown(function(event) {
       
		var $seekBar = $(this).parent();
         
        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
 
            updateSeekPercentage($seekBar, seekBarFillRatio);
			seek(seekBarFillRatio);
         });
     
         $(document).bind('mouseup.thumb', function() {
         $(document).unbind('mousemove.thumb');
         $(document).unbind('mouseup.thumb');
         });
     });
};

var trackIndex = function(album, song) {
     return album.songs.indexOf(song);
};

var updatePlayerBarSong = function() {
	$('.currently-playing .song-name').text(currentSongFromAlbum.title);
	$('.currently-playing .artist-name').text(currentAlbum.artist);
	$('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);	
	$('.main-controls .play-pause').html(playerBarPauseButton);
	
	setTotalTimeInPlayerBar(currentSongFromAlbum.duration);

};

var nextSong = function() {
	var getLastSongNumber = function(index) {
		return index == 0? currentAlbum.songs.length : index;
	};
	var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
	currentSongIndex++;
	
	if (currentSongIndex >= currentAlbum.songs.length){
		currentSongIndex = 0;
	}
	
	setSong(currentSongIndex + 1);
	currentSoundFile.play();
	updatePlayerBarSong();
	updateSeekBarWhileSongPlays();
	var lastSongNumber = getLastSongNumber(currentSongIndex);
	var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
	var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
	
	$lastSongNumberCell.html(lastSongNumber);
	$nextSongNumberCell.html(pauseButtonTemplate);
	
};

var previousSong = function() {
	var getLastSongNumber = function(index) {
		return index == (currentAlbum.songs.length - 1)? 1 : index + 2;
	};
	var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
	currentSongIndex--;
	
	if (currentSongIndex < 0){
		currentSongIndex = currentAlbum.songs.length - 1;
	}
	
	setSong(currentSongIndex + 1);
	currentSoundFile.play();	
	updatePlayerBarSong();
	updateSeekBarWhileSongPlays();
	var lastSongNumber = getLastSongNumber(currentSongIndex);
	var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
	
	$lastSongNumberCell.html(lastSongNumber);
	$previousSongNumberCell.html(pauseButtonTemplate);
	
};

var setSong = function(songNumber) {
	if (currentSoundFile) {
		currentSoundFile.stop();
	}
	currentlyPlayingSongNumber = parseInt(songNumber);
	currentSongFromAlbum = currentAlbum.songs[songNumber - 1];	
	currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
		formats: [ 'mp3' ],
		preload: true		
	});
	
	setVolume(currentVolume);
};

var seek = function(percent) {
     if (currentSoundFile) {
		 var time = currentSoundFile.getDuration()*percent;
         currentSoundFile.setTime(time);
     }
 };

var setVolume = function(volume) {
     if (currentSoundFile) {
         currentSoundFile.setVolume(volume);
     }
 };

var getSongNumberCell = function (number) {
	return $('.song-item-number[data-song-number="' + number + '"]');
};



var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSong = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var currentSoundFile = null;
var currentVolume = 80;


$(document).ready(function() {
	setCurrentAlbum(albumPicasso);
	setupSeekBars();
	$previousButton.click(previousSong);
	$nextButton.click(nextSong);
});
