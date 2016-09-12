// カメラ／マイクにアクセスするためのメソッドを取得しておく
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
 
var localStream;    // 自分の映像ストリームを保存しておく変数
var connectedCall;  // 接続したコールを保存しておく変数
 
// SkyWayのシグナリングサーバーへ接続する (APIキーを置き換える必要あり）
var peer = new Peer({ key: $ENV{api_key}, debug: 3});
 
// シグナリングサーバへの接続が確立したときに、このopenイベントが呼ばれる
peer.on('open', function(){
    // 自分のIDを表示する
    // - 自分のIDはpeerオブジェクトのidプロパティに存在する
    // - 相手はこのIDを指定することで、通話を開始することができる
    $('#my-id').text(peer.id);
});
 
// 相手からビデオ通話がかかってきた場合、このcallイベントが呼ばれる
// - 渡されるcallオブジェクトを操作することで、ビデオ映像を送受信できる
peer.on('call', function(call){
    // 切断時に利用するため、コールオブジェクトを保存しておく
    connectedCall = call;
 
    // 相手のIDを表示する
    // - 相手のIDはCallオブジェクトのpeerプロパティに存在する
    $("#peer-id").text(call.peer);
 
    // 自分の映像ストリームを相手に渡す
    // - getUserMediaで取得したストリームオブジェクトを指定する
    call.answer(localStream);
 
    // 相手のストリームが渡された場合、このstreamイベントが呼ばれる
    // - 渡されるstreamオブジェクトは相手の映像についてのストリームオブジェクト
    call.on('stream', function(stream){
 
        // 映像ストリームオブジェクトをURLに変換する
        // - video要素に表示できる形にするため変換している
        var url = URL.createObjectURL(stream);
 
        // video要素のsrcに設定することで、映像を表示する
        $('#peer-video').prop('src', url);
    });
});
 
// DOM要素の構築が終わった場合に呼ばれるイベント
// - DOM要素に結びつく設定はこの中で行なう
$(function() {
 
    // カメラ／マイクのストリームを取得する
    // - 取得が完了したら、第二引数のFunctionが呼ばれる。呼び出し時の引数は自身の映像ストリーム
    // - 取得に失敗した場合、第三引数のFunctionが呼ばれる
    navigator.getUserMedia({audio: true, video: true}, function(stream){
 
        // このストリームを通話がかかってき場合と、通話をかける場合に利用するため、保存しておく
        localStream = stream;
 
        // 映像ストリームオブジェクトをURLに変換する
        // - video要素に表示できる形にするため変換している
        var url = URL.createObjectURL(stream);
 
        // video要素のsrcに設定することで、映像を表示する
        $('#my-video').prop('src', url);
 
    }, function() { alert("Error!"); });
 
    // Start Callボタンクリック時の動作
    $('#call-start').click(function(){
 
        // 接続先のIDをフォームから取得する
        var peer_id = $('#peer-id-input').val();
 
        // 相手と通話を開始して、自分のストリームを渡す
        var call = peer.call(peer_id, localStream);
            
        // 相手のストリームが渡された場合、このstreamイベントが呼ばれる
        // - 渡されるstreamオブジェクトは相手の映像についてのストリームオブジェクト
        call.on('stream', function(stream){
            // 相手のIDを表示する
            $("#peer-id").text(call.peer);
 
            // 映像ストリームオブジェクトをURLに変換する
            // - video要素に表示できる形にするため変換している
            var url = URL.createObjectURL(stream);
 
            // video要素のsrcに設定することで、映像を表示する
            $('#peer-video').prop('src', url);
         
        // 相手への接続を開始する
        connect = peer.connect(peer_id);
 
        // 接続が完了した場合のイベントの設定
        connect.on("open", function() {});
 
        // メッセージ受信イベントの設定
        connect.on("data", onRecvMessage);
        });
    });
 
    // End　Callボタンクリック時の動作
    $('#call-end').click(function(){
        // ビデオ通話を終了する
        connectedCall.close();
        connect.close();
    });
});

/**
**チャットの部分のJSのところを記述
**
**/
//connectはPR
var connect;     // データ通信用connectionオブジェクトの保存用変数 

// 相手からデータ通信の接続要求イベントが来た場合、このconnectionイベントが呼ばれる
// - 渡されるconnectionオブジェクトを操作することで、データ通信が可能
peer.on('connection', function(connection){
  　
    // データ通信用に connectionオブジェクトを保存しておく
    connect = connection;
 
    // 接続が完了した場合のイベントの設定
    connect.on("open", function() {
        // 相手のIDを表示する
        // - 相手のIDはconnectionオブジェクトのidプロパティに存在する
        $("#peer-id").text(connect.id);
    });
 
    // メッセージ受信イベントの設定
    connect.on("data", onRecvMessage);
});
 
// メッセージ受信イベントの設定
function onRecvMessage(data) {
    // 画面に受信したメッセージを表示
    $("#messages").append($("<p>").text(connect.id + ": " + data).css("font-weight", "bold"));
    //document.write('<img src="' + data + '"' + 'width="300" height="300">');
}
 
// DOM要素の構築が終わった場合に呼ばれるイベント
// - DOM要素に結びつく設定はこの中で行なう
$(function() {
 
    // Connectボタンクリック時の動作
    $("#connect").click(function() {
        // 接続先のIDをフォームから取得する
        var peer_id = $('#peer-id-input').val();
 
        // 相手への接続を開始する
        connect = peer.connect(peer_id);
 
        // 接続が完了した場合のイベントの設定
        connect.on("open", function() {
            // 相手のIDを表示する
            // - 相手のIDはconnectionオブジェクトのidプロパティに存在する
            $("#peer-id").text(connect.id);
        });
 
        // メッセージ受信イベントの設定
        connect.on("data", onRecvMessage);
    });
 
    // Sendボタンクリック時の動作
    $("#send").click(function() {
        // 送信テキストの取得
        var message = $("#message").val();
 
        // 送信
        connect.send(message);
 
        // 自分の画面に表示
        $("#messages").append($("<p>").html(peer.id + ": " + message));
 
        // 送信テキストボックスをクリア
        $("#message").val("");
    });
 
    // Closeボタンクリック時の動作
    $("#close").click(function() {
        connect.close();
    });
});
/*
$(document).ready(function() {
var userFeed = new Instafeed({
    target: '#messages',
    get: 'user', //ユーザーから取得
    userId: '3285987949', //ユーザーID(先ほど確認した'user_id')
    sortBy: 'most-recent',//最新記事から順に取得
    links: true , //画像リンク取得
    limit: 3, //取得する画像数を設定
    resolution: 'low_resolution', //画像サイズを設定
    template: '<li><a href="{{link}}"><img src="{{image}}" target="_blank"></a></li>',
    accessToken: '3285987949.5c1560b.38fe0218e90b48a1b2a3b828478f882d' //アクセストークン
    });
    userFeed.run();
});
*/
