
var styleTag = document.createElement('style');
styleTag.textContent = `
#cm_volume_on_off_switch {
  position: fixed;
  top: 10px;
  left: 420px;
  width: 50px;
  height: 30px;
  border-radius: 20px;
  background: #411fff63;
  cursor: pointer;
  z-index: 10000;
  text-align: center;
  line-height: 30px;
  font-weight: bold;
}
#cm_volume_on_off_switch.on {
  background: #00ff7d7a;
}

#cm_volume_switch {
  position: fixed;
  top: 10px;
  left: 480px;
  width: 50px;
  height: 30px;
  border-radius: 20px;
  background: #ca1fff63;
  cursor: pointer;
  z-index: 10000;
}
#cm_volume_switch.on {
  background: blue;
}
#is_cm_on #observer_target .sub_video {
  width: 100%;
  height: auto;
  right: 0;
}
#is_cm_on .channel-root--hold-chat + .persistent-player,
#is_cm_on .channel-root--watch-chat + .persistent-player,
#is_cm_on .channel-root__info--with-chat .channel-info-content,
#is_cm_on .channel-root__player--with-chat {
  width: calc(100% - 60rem);
}
#is_cm_on .right-column--beside .channel-root__right-column {
  transform: translateX(-60rem) translateZ(0px) !important;
  width: 60rem;
}
#is_cm_on .right-column .right-column__toggle-visibility {
  left: -25rem;
}
#is_cm_on .right-column .right-column__toggle-visibility--with-chat-video-player-and-turbo-ads-upsell {
  left: -25rem;
  top: 35.5rem;
}
`;
document.head.appendChild(styleTag);

let is_on = true;
let is_mute = false;
let is_manual_mute = false;

setTimeout(function(){

  is_mute = is_mute_now();
  if(is_mute){
    is_manual_mute = true;
  }


  if($("#Exit-chat-container").get(0)){
    $("#Exit-chat-container").parents(".chat-shell").find("> div").attr("id","observer_target")
  }

  if($('[data-a-target="video-ref"]').get(0)){
    $('[data-a-target="video-ref"]').attr("id","main_video_target")
    $("#main_video_target > div > div > div .avap-ads-container").parent().attr("id","ads_target");
    $("#main_video_target > div > div > div .avap-ads-container").each(function(i,v){
      //$(this).attr("id","observer_target"+i)
    })
  }

  if($("#ads_target").get(0)){
    console.log("0 監視開始","is_mute:",is_mute)
    // 監視ターゲットの取得
    const target = $('#ads_target').get(0);

    // オブザーバーの作成
    const observer = new MutationObserver(records => {
      check_change();
    })

    // 監視の開始
    observer.observe(target, {
      childList: true
    })
  }

  $("body").append($("<div>").addClass("on").attr({id:"cm_volume_on_off_switch"}).text("on"));
  $("#cm_volume_on_off_switch").on("click", function(){
    if(!is_on){
      is_on = true;
      $(this).addClass("on");
      $(this).text("on");
    }
    else{
      is_on = false;
      $(this).removeClass("on");
      $(this).text("off");
    }
  });


  $("body").append($("<div>").attr({id:"cm_volume_switch"}));
  $("#cm_volume_switch").on("click", function(){
    if(!is_mute){
      $(this).addClass("on");
      mute();
      console.log("発動")
      if($("#observer_target > div").find("video").get(0)){
        console.log($("#observer_target > div").find("video"))
        $("#observer_target > div").find("video").attr("controls", "true");
        $("#observer_target > div").find("video").get(0).volume = get_volume() / 100;
        $("#observer_target > div").find("video").get(0).muted = false;
      }
      is_mute = true;
    }
    else{
      $(this).removeClass("on");
      unmute();
      if($("#observer_target > div").find("video").get(0)){
        $("#observer_target > div").find("video").get(0).volume = 0;
        $("#observer_target > div").find("video").get(0).muted = true;
      }
      is_mute = false;
    }
  });

  check_change();

},5000)


function check_change(){

  if(!is_on){
    console.log("is_off")
    return false;
  }

  let flag = $("#ads_target").find("> div").length == 2 ? "cm終了" : "cm開始";

  console.log("1 変更検知", flag)

  if(flag == "cm開始"){
    is_manual_mute = is_mute_now();
    console.log("is_manual_mute:", is_manual_mute)
    mute();
    if($("#observer_target > div").find("video").get(0)){
      $("body").attr("id", "is_cm_on");
      console.log("paused:",$("#observer_target > div").find("video").get(0).paused);
      $("#observer_target > div").find("video").attr("controls", "true");
      $("#observer_target > div").find("video").addClass("sub_video")
      $("#observer_target > div").find("video").get(0).volume = get_volume() / 100;
      $("#observer_target > div").find("video").get(0).muted = false;
    }
  }
  if(flag == "cm終了"){
    $("body").attr("id", "is_cm_off");
    console.log("is_manual_mute:", is_manual_mute)
    if(!is_manual_mute){
      unmute();
    }
    if($("#observer_target > div").find("video").get(0)){
      console.log("paused:",$("#observer_target > div").find("video").get(0).paused);
      $("#observer_target > div").find("video").removeClass("sub_video")
      $("#observer_target > div").find("video").get(0).volume = 0;
      $("#observer_target > div").find("video").get(0).muted = true;
    }
  }
}

function get_volume(){
  return Number($('[data-a-target="player-volume-slider"]').attr("aria-valuenow"));
}

function is_mute_now(){
  return $('[data-a-target="player-mute-unmute-button"]').attr("aria-label") == "ミュート解除（m）";
}

function mute(){
  if($('[data-a-target="player-mute-unmute-button"]').attr("aria-label") == "ミュート（m）"){
    $('[data-a-target="player-mute-unmute-button"]').click()
  }
}
function unmute(){
  if($('[data-a-target="player-mute-unmute-button"]').attr("aria-label") == "ミュート解除（m）"){
    $('[data-a-target="player-mute-unmute-button"]').click()
  }
}
