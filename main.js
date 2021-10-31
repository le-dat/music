const $ = document.querySelector.bind(document) ;
const $$ = document.querySelectorAll.bind(document) ;

const PLAYER_STORAGE_KEY = 'Dat_dep_trai_player' ;
const play = $('.player');
const heading = $('.page-header-name') ;
const cd = $('.cd ') ;
const thumb = $('.thumb') ;
const audio = $('#audio') ;
const btnPlay = $('.btn-play') ;
const progress = $('#progress') ;
const btnRedo = $('.btn-redo') ;
const btnPre = $('.btn-pre') ;
const btnNext = $('.btn-next') ;
const btnRandom = $('.btn-random') ;
const playList = $('.container-cover');

const app = {
    currentIndex : 0, // index of current
    isPlaying : false , // tắt nhạc 
    isRandom : false ,
    isRedo : false ,
    config :JSON.parse(localStorage.getItem('PLAYER_STORAGE_KEY')) || {},
    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem('PLAYER_STORAGE_KEY', JSON.stringify(this.config))
    },

    songs : [
        {
            name : 'Chiều Nay Không Có Mưa Bay' ,
            single : 'Trung Quan idol' ,
            path : './asset/music/1.mp3' ,
            image : './asset/avarta/1.png' 
        } ,
        {
            name : 'Diu Dàng Em Đến' ,
            single : 'ERIK, NinjaZ' ,
            path : './asset/music/2.mp3' ,
            image : './asset/avarta/2.png' 
        } ,
        {
            name : 'Có Hẹn Với Thanh Xuân' ,
            single : 'MONSTAR' ,
            path : './asset/music/3.mp3' ,
            image : './asset/avarta/3.png' 
        } ,
        {
            name : 'Đường Tôi Chở Em Về (Orinn Remix)' ,
            single : 'Various Artists' ,
            path : './asset/music/4.mp3' ,
            image : './asset/avarta/4.png' 
        } ,
        {
            name : 'Lạc Trôi (Remix)' ,
            single : 'Sơn Tùng M-TP' ,
            path : './asset/music/5.mp3' ,
            image : './asset/avarta/5.png' 
        } ,
        {
            name : 'Summertime' ,
            single : 'K-391' ,
            path : './asset/music/6.mp3' ,
            image : './asset/avarta/6.png' 
        } ,
        ,
        {
            name : 'Nơi Này Có Anh (Masew Bootleg)' ,
            single : 'Sơn Tùng M-TP, Masew' ,
            path : './asset/music/7.mp3' ,
            image : './asset/avarta/7.png' 
        } ,
        
    ] ,
    render: function() {
        const html = this.songs.map((song , index) => {
            return `
            <div class="container-music ${(index === this.currentIndex) ? 'active' : ''} " data-index = ${index}>
                 <div class="container-music-avata">
                     <img src="${song.image}" alt="">
                 </div>
                
                 <div class="container-music-desc">
                     <h3 class="container-music-desc-header">${song.name}</h3>
                     <h5 class="container-music-desc-body">${song.single}</h5>
                 </div>
        
                 <div class="container-music-icon">
                     <i class="fas fa-ellipsis-h ellipsis"></i>
                 </div>
             </div>`
        })
        playList.innerHTML = html.join('') ;
    } ,

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong' ,{
            get: function() {
                return this.songs[this.currentIndex] ;
            }
        })
    },
    handleEvent: function(){
        const cdWidth = thumb.offsetWidth ;

        // xu li cd quay vong 
        const cdThumbAnimate = thumb.animate([
            { transform: 'rotate(360deg)'}
        ] , {
            duration: 10000 ,// 10 seconds
            iterations: Infinity 
        })
        cdThumbAnimate.pause() ;

        // xử lí phóng to / thu nhỏ cd 
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop ;

            cd.style.width = (newCdWidth > 0) ? newCdWidth + 'px' : 0 ;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // xử lí nút play / pause 
        btnPlay.onclick = function(){
            if (app.isPlaying){
                audio.pause() ;

            } else {
                audio.play() ;
            }
            // mở nhạc 
            audio.onplay = function() {
                app.isPlaying = true ; 
                play.classList.add('playing') ;
                cdThumbAnimate.play() ;
            }
            // dung nhac
            audio.onpause = function() {
                app.isPlaying = false ;
                play.classList.remove('playing') ;
                cdThumbAnimate.pause() ;
            }
        }

        // xu li tien do bai hat
        audio.ontimeupdate = function() {
            if (audio.duration ) {
                const progressPercentage = Math.floor(audio.currentTime / audio.duration * 100) ;
                progress.value = progressPercentage ;
            }
        }

        // xu li khi tua bai - seek
        progress.onchange = function(e) {
            const seekTime = (audio.duration / 100) * e.target.value ;
            audio.currentTime = seekTime ;
            // audio.duration --> tong so time
            // e.target.value --> so giay hien tai
        }

        // xu li bai hat tiep theo 
        btnNext.onclick = function() {
            if(app.isRandom)
                app.randomSong() ;
            else
                app.nextSong() ;

            audio.play() ;
            app.render() ;
            app.scrollToActiveSong () ;
        }

        // xu li bai hat truoc 
        btnPre.onclick = function(){
            if (app.isRandom)
                app.randomSong() ;
            else
                app.preSong() ;

            audio.play() ;
            app.render() ;
            app.scrollToActiveSong() ;
        }

        // xu li random song 
        btnRandom.onclick = function(){
            app.isRandom = ! app.isRandom ;
            app.setConfig('isRandom', app.isRandom) ;
            btnRandom.classList.toggle('active', app.isRandom) ;
        }

        // xu li lap lai song 
        btnRedo.onclick = function(){
            app.isRedo = ! app.isRedo ;
            app.setConfig('isRedo', app.isRedo) ;
            btnRedo.classList.toggle('active' , app.isRedo) ;
        }

        // xu li khi end song 
        audio.onended = function(){
            if (app.isRedo)
                audio.play() ;
            else    
                btnNext.onclick() ; // giong nhu click vao btnNext // or coppy code of btnNext vao
        }
        
        // xu li khi nhap vao song khac
        // e.target ---> click vao tung element trong no
        playList.onclick = function(e) {
            const songNode = e.target.closest('.container-music:not(.active)') ;
            
            if (songNode || e.target.closest('.ellipsis')) {// xu li khi nhap vao song khac or option ba chấm 
                // khi click vao songNode
                if (songNode){
                    app.currentIndex = Number(songNode.dataset.index) ;
                    app.loadCurrentSong() ;
                    app.render() ;
                    audio.play() ;
                }
                //khi click vao ellipsis 
                if (e.target.closest('.ellipsis')){

                }

            }
        }
    },

    // auto trượt xuống mỗi lần next song 
    scrollToActiveSong : function (){
        setTimeout(function(){
            $('.container-music.active').scrollIntoView({
                behaviour: 'smoll' ,
                block: 'nearest' 
            })
        },300)
    } ,
    loadCurrentSong : function(){
        heading.textContent = app.currentSong.name 
        cd.src = this.currentSong.image 
        audio.src = this.currentSong.path 

    },
    loadConfig : function () {
        this.isRandom = this.config.isRandom ;
        this.isRedo = this.config.isRedo ;
    },
    nextSong : function(){
        this.currentIndex++ ;
        if (this.currentIndex >= this.songs.length )
            this.currentIndex = 0 ;
        
        this.loadCurrentSong() ;
    } ,
    preSong : function(){
        this.currentIndex-- ;
        if (this.currentIndex < 0) // currentIndex = 0  
            this.currentIndex = this.songs.length - 1;
        
        this.loadCurrentSong() ;
    } ,
    randomSong : function(){
        let newIndex ;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        }
        while (newIndex === this.currentIndex)

        this.currentIndex = newIndex ;
        this.loadCurrentSong() ;
    } ,

    start: function(){
        // gán cấu hình từ config vào app -- lưu trữ redo & random đối với app (không bị mất khi load lại trang)
        this.loadConfig() ;
        
        // định nghĩa thuộc tính
        this.defineProperties() ;

        // xử lí sự kiện 
        this.handleEvent() ;

        // load thông tin bài hát 
        this.loadCurrentSong() ;

        // render list bai hat
        this.render() ;

        // hiển thị trạng thái ban đầu của redo & random 
        btnRandom.classList.toggle('active', app.isRandom) ;
        btnRedo.classList.toggle('active' , app.isRedo) ;
    }
}

app.start() ;

