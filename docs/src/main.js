$(function() {
    "use strict";
    //はじめから
    $("#new-start").on("click", function(){
        //htmlファイルを読み込んで注意事項を表示する。
        $.get("data/event/注意事項.html", function(data){
            $("#contents").empty();     //リセット
            $("#contents").append(data);//表示
            //スタートに移動する。
            Start();
        });
    });


    //スタート
    function Start () {
        $("#start").on("click", function(){
            //はじめからで表示したリストやコンテンツを削除する。
            $("#list").empty();
            $("#contents").empty();
            //メニューに移動して、メニューを配置する。
            MenuWindow();
            //セーブデータを設置する。
            newData();
            //オープニングシナリオを表示する。
            Text("data/event/オープニング.txt");
        });
    }


    //オープニングが長いために、上にスクロールする処理
    $('#top').click(function () {
        $("html,body").animate({scrollTop:0},"300");
    });


    //メニューを設置する。
    function MenuWindow (){
        systemMenu();
        customMenu();
    }


    /* システムメニュー
    元々、メニューまたはメニュー1と定義していたが、システムメニューと命名し直した。 */
    function systemMenu(){
        $.get("data/menu/menu.html", function(data){
            $("#menu").empty();
            $("#menu").append(data);
            Start();
        });
    }


    //カスタムメニュー
    function customMenu (){
        $.get("data/menu/menu.txt", function(data){
            data = data.split(/\r?\n/g);
            let text = [];
            data.forEach(currentValue => {
                text += `<button id="${currentValue}" class="menu-button2">${currentValue}</button>`;
            })
            $("#menu2").append(text);
            $(".menu-button2").on("click", function(){
                Menu(`data/menu/${this.id}.txt`);
            });
            /* 1月14日に、ここにあったlist関数を移動した。しかし着火しなくなったので元に戻した。*/
            List();
        });
    }


    //セーブデータを設置する。
    function newData (){
        //デバッグ処理は確認作業用にデータを初期化している。システムに害がないことから放置する。
        sessionStorage.clear()//デバッグ用
        sessionStorage["記憶"] = null;
        sessionStorage["特徴"] = null;
        newFlag();
        newParameter();
    }


    function newFlag(){
        $.get("data/event/フラグ.txt", function(data){
            data = data.split(/\r?\n/g);
            data.forEach(currentValue => {
                sessionStorage[currentValue] = "off";
            })
        });
    }


    function newParameter(){
        $.get("data/event/パラメーター.txt", function(data){
            data = data.split(/\r?\n/g);
            data.forEach(currentValue => {
                sessionStorage[currentValue] = "0";
            })
        });
    }


    //キャラクターで特徴とか記憶を表示するコード
    function Character (name) {
        //1月14日にnullかどうかを確認するようにした。
        if(sessionStorage.getItem(name) != "null"){
            let memory = Get(name);
            let text = [];
            memory.forEach(currentValue => {
                text += `<p class="text">${currentValue}</p>`;
                $("#contents").empty();
                $("#contents").append(text);
            })
        }
    }


    //文字列を配列にするコード
    function Get(name) {
        let ver;
        console.log(sessionStorage.getItem(name));
        if(sessionStorage.getItem(name) != "null"){
            console.log("生きてる？");
            const data = sessionStorage.getItem(name).split(',');
            ver = data;
        } else {
            ver = null;
        }
        return ver;
    }


    /* リストクリック処理のコード。
    面倒だから、わかる程度でゴリゴリifれ。
    */
    function List () {
        //メニュー読み込み後じゃないと動かないので、とりあえずここに置いた。そのうち移動させること。
        $("#character").on("click", function(){
            Menu(`data/menu/character.txt`);
        });
        $("#time").on("click", function(){
            console.log("hey");
            Event2(`data/event/第二章/イベント.json`);
            $("#menu2").empty();
        });
        $(".list-button").on("click", function(){
            if("記憶" == this.id) {
                Character("記憶");
            } else if("特徴"  == this.id) {
                Character("特徴");
            } else if("プロフィール"  == this.id) {
                $("#contents").empty();
                $.getJSON(`data/character/ヒロイン.json`, function(data){
                    const text =`<p class="text">名前:${data.name}</p><p class="text">年齢:${data.年齢}</p><p class="text">身長:${data.身長}</p><p class="text">胸:${data.胸}</p>`;
                    $("#contents").append(text);
                });
            } else {
                const id =this.id;
                $("html,body").animate({scrollTop:0},"300");//トップに動かす。
                Json(`data/command/${id}/${id}.json`,id)
            };
        });
    }


    //ストレージ内の記憶とデータの記憶の条件が一致しているかを判定する。
    function memoryIf(currentValue){
        let i = [null]
        const ver = Get("記憶");
        console.log(ver);
        if(ver != null) {
            let k ="off";
            ver.forEach(z => {
                console.log(z);//ここ
                console.log(currentValue.値);
                if(currentValue.値==z){
                    i.push("ok");
                    k = "on";
                }
            })
            //一致がなかった場合
            if(k == "off") {
                i.push("off");
            }
        } else {
            i.push("off");
        }
        return i;
    }


    //ストレージ内のパラメーターとデータのパラメーター条件が一致しているかを判定する。
    function parameterIf(currentValue){
        let i = [null]
        console.log("パラメーター");
        console.log(currentValue.値);
        if(currentValue.値 == sessionStorage.getItem(currentValue.名前)){
            i.push("ok");
        } else {
            i.push("no");
        }
        return i;
    }


    //判定
    function result (i,data){
        i = i.filter(Boolean);
        console.log(data.差分.条件.設定);
        if(data.差分.条件.設定 == "全て") {
            console.log(i);
            const ok = (currentValue) =>  currentValue=="ok";
            console.log(i.every(ok));
            if(i.every(ok)){
                mainData(data.差分);
                sessionStorage["差分"] = "on"; 
            } else{
                mainData(data.基本);
            }
        } else if(data.差分.条件.設定 =="どれか"){
            console.log(i);
            const ok = (currentValue) =>  currentValue=="ok";
            console.log(i.some(ok));
            if(i.some(ok)){
                mainData(data.差分);
                sessionStorage["差分"] = "on"; 
            } else{
                mainData(data.基本);
            }
        }
    }


    function Json (url,id) {
        $.getJSON(url, function(data){
            if(data.差分 != null){
                //複数の条件を確認する
                let i = [null];
                data.差分.条件.判定.forEach(currentValue => {
                    //記憶とパラメーターの処理は違う。
                    console.log(currentValue.名前);
                    if(currentValue.名前 == "記憶"){
                        i = memoryIf(currentValue);
                        console.log(i);
                    } else {
                        i = parameterIf(currentValue);
                        console.log(i);
                    }
                })
                result(i,data);
            }
            if("on"==sessionStorage.getItem("差分")){
                Text(`data/command/${id}/差分.txt`);
                sessionStorage["差分"] = "off";
            } else {
                Text(`data/command/${id}/${id}.txt`);

            }
        });
    }


    //7日に引越しした仕様変更の塊
    function mainData (data){
        Time(data.時間);
        parameter(data);
        sessionStorage["ログ"] = data.記憶;
       if (data.記憶 != null){
        featureMemory("記憶",data);
    }
        console.log(data.特徴);
        if (data.特徴 != null){
            featureMemory("特徴",data);
        }
    }


    function parameter(data) {
        if (data.パラメーター != null) {
            data.パラメーター.forEach(currentValue => {
                console.log(currentValue);
                console.log(currentValue.名前);
                let parameter;
                console.log(sessionStorage.getItem(currentValue.名前));
                console.log(isNaN(sessionStorage.getItem(currentValue.名前)));
                //ここで変な情報が記録されてしまう場合は、フラグデータが抜けている可能性が高い。
                if(isNaN(sessionStorage.getItem(currentValue.名前))){
                    parameter = currentValue.数値;
                    console.log(parameter);
                } else {
                    console.log(sessionStorage.getItem(currentValue.名前));
                    const getParameter = Number(sessionStorage.getItem(currentValue.名前));
                    parameter = getParameter + currentValue.数値;
                }
                sessionStorage[currentValue.名前] = parameter;
            })
        }
    }


    function featureMemory(name, data){
        //console.log(memory);//デバッグ用
        let memory = [null];
        Object.assign(memory,Get(name));
        console.log(memory);
        //デバッグコメント。ここまで空白。
        memory = Over(memory,data[name]);
        console.log(memory);
        console.log(data[name]);
        memory = memory.filter(Boolean);
        console.log(memory);
        sessionStorage[name] = memory;
    }


    //[]の問題を解決する。nullを初手に与えてフィルタする。
    //重複した記憶を確認する処理
    function Over( mData,data){
        console.log(mData);
        let over = true;
        //なんのためのifか話からない。とりあえず放置。バグの対処ようだったかも。
        //if (mData == []) {
            mData.forEach(currentValue => {
                //重複していた場合、over変数がfalseに変わる
                if(currentValue == data) {
                    over  = false;
                    console.log(over);
                }
            })
        //}
        //ここでmemoryを処理
        if(over == true) {
            mData.push(data);
        }
        return mData;
    }


    function Time (time) {
        console.log("time");
        let y = sessionStorage.getItem("y");
        let m = sessionStorage.getItem("m");
        let day = sessionStorage.getItem("day");
        let h = sessionStorage.getItem("h");
        let min = sessionStorage.getItem("min");
        y = Number(y);
        m = Number(m);
        day = Number(day);
        h = Number(h);
        min = Number(min);
        y += time.年;
        m += time.月;
        day += time.日;
        h += time.時;
        min += time.分;
        if (min > 59) {
            h -=60;
            h +=1;
        }
        if (h > 23) {
            h -=24;
            day +=1;
        }
        if (day > 29) {
            day -=30;
            m +=1;
        }
        if (m > 11) {
            day -=12;
            y +=1;
        }
        sessionStorage["y"] = y;
        sessionStorage["m"] = m;
        sessionStorage["day"] = day;
        sessionStorage["h"] = h;
        sessionStorage["min"] = min;
        $("#y").text(`${y}年目`);
        $("#m").text(`${m}月`);
        $("#day").text(`${day}日`);
        $("#h").text(`${h}時`);
        $("#min").text(`${min}分`);
        Event();
    }


    function Event() {
        $.getJSON("data/event/イベント.json", function(data){
            data.イベント.forEach(t => {
            //複数の条件を確認する
            let i = [null];
            t.判定.forEach(currentValue => {
                    //記憶とパラメーターの処理は違う。
                    console.log(currentValue.名前);
                    if(currentValue.名前 == "記憶"){
                        i = memoryIf(currentValue);
                        console.log(i);
                    } else if(currentValue.名前 == "特徴"){
                        const ver = Get("特徴");
                        console.log(ver);
                        if(ver != null) {
                            let k ="off";
                            ver.forEach(z => {
                                console.log(z);//ここ
                                console.log(currentValue.値);
                                if(currentValue.値==z){
                                    i.push("ok");
                                    k = "on";
                                }
                            })
                            //一致がなかった場合
                            if(k == "off") {
                                i.push("off");
                            }
                        } else {
                            i.push("off");
                        }
                    } else {
                        i = parameterIf(currentValue);
                        console.log(i);
                    }
            })
                //判定結果を処理する
                i = i.filter(Boolean);
                console.log(t.設定);
                if(t.設定 == "全て") {
                    console.log(i);
                    const ok = (currentValue) =>  currentValue=="ok";
                    console.log(i.every(ok));
                    if(i.every(ok)){
                        //ここ
                        featureMemory("特徴",t.追加);
                        //ここ
                        let memory = [null];
                        Object.assign(memory,Get("特徴"));
                        t.削除.特徴.forEach(q => {
                            let idx = memory.indexOf(q);
                            if(idx >= 0){
                             memory.splice(idx, 1); 
                            }
                        })
                        sessionStorage["特徴"] = memory;
                    }
                } else if(t.設定 =="どれか"){
                    console.log(i);
                    const ok = (currentValue) =>  currentValue=="ok";
                    console.log(i.some(ok));
                    if(i.some(ok)){
                        //ここ
                        let memory = [null];
                        featureMemory("特徴",t.追加);
                        Object.assign(memory,Get("特徴"));
                        t.削除.特徴.forEach(q => {
                            let idx = memory.indexOf(q);
                            if(idx >= 0){
                             memory.splice(idx, 1); 
                            }
                        })
                        sessionStorage["特徴"] = memory;
                    }
                }
            })
        });
    }


    function Text(url) {
        $.get(url, function(data){
            data = data.replace(/\r?\n/g, '<p class="text">');
            //console.log(data);
            data = data.replace(/<p class="text"><p class="text">/g, '</p><br><p class="text">');
            $("#contents").empty();
            $("#contents").append(data);
        });
    }

 //バグの末期で破棄
    function Event2 (url) {
        console.log("test2");
        $.getJSON(url, function(data){
            const t = data;
            let x = t.イベント.length;
            let z = 0;
            console.log("わけわからん" + x);
            while(z < x) {
                let i = [null];
                console.log(data.イベント[z].判定);
                data.イベント[z].判定.forEach(currentValue => {
                    //記憶とパラメーターの処理は違う。
                    console.log(currentValue);
                    if(currentValue.名前 == "記憶"){
                        i = memoryIf(currentValue);
                        console.log(i);
                    } else if (currentValue.名前 == "特徴") {
                        const ver = Get("特徴");
                        console.log(ver);
                        if(ver != null) {
                            let k ="off";
                            ver.forEach(z => {
                                console.log(z);//ここ
                                console.log(currentValue.値);
                                if(currentValue.値==z){
                                    i.push("ok");
                                    k = "on";
                                }
                            })
                            //一致がなかった場合
                            if(k == "off") {
                                i.push("off");
                            }
                        } else {
                            i.push("off");
                        }
                    } else {
                        i = parameterIf(currentValue);
                        console.log(i);
                    }
                })
                //判定結果を処理する
                i = i.filter(Boolean);
                if(t.イベント[z].設定 == "全て") {
                    console.log(i);
                    const ok = (currentValue) =>  currentValue=="ok";
                    console.log(i.every(ok));
                    if(i.every(ok)){
                        console.log("a");
                        Text(`data/event/第二章/${t.イベント[z].名前}.txt`);
                        z += data.イベント.length;
                    } else {
                        z++;
                    }
                } else if(t.イベント[z].設定 =="どれか"){
                    console.log(i);
                    const ok = (currentValue) =>  currentValue=="ok";
                    console.log(i.some(ok));
                    if(i.some(ok)){
                        console.log("b");
                        Text(`data/event/第二章/${t.イベント[z].名前}.txt`);
                        z += data.イベント.length;
                    } else {
                        z++;
                    }
                }
                console.log(z);
            }
        });
    }



    function Menu(url) {
        $.get(url, function(data){
            data = data.split(/\r?\n/g);
            let text = [];
            data.forEach(currentValue => {
                text += `<button id="${currentValue}" class="list-button">${currentValue}</button>`;
            })
            $("#list").empty();
            $("#list").append(text);
            List();
        });
    }
}); 