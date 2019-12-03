(function($) {
    //取得留言
    function getReply() {
        $.ajax({
            url: '/reply' + '?id=' + $('#article_id').val(),
            type: 'get',
            datatype: 'json'
        }).done(function(res) {
            res.replyList.forEach(replyItem => {
                renderReply(replyItem)
            });
            //判斷留言數量是否需要摺疊按鈕
            if ($('.reply__item').length > 3) {
                hideReply()
            }
            $('#older_reply').html(`看較舊的${res.replyList.length-3}則留言`)
        }).fail(function(err) {
            alert('暫時無法取得文章留言，請稍後再試')

        })
    }


    function renderReply(replyItem) {
        //如果那篇留言者是自己，則需要渲染控制面板
        let username = $('#user_username').text()
        if (replyItem.username == username) {
            var { control, id } = controlReply(replyItem)
        } else {
            var control = ''
        }
        let html = `
   <div class="reply__item" id="${replyItem._id}">
       <div class="pic">
           <img src="${replyItem.headimg}" alt="留言人大頭照" class="pic_img">
       </div>
       <div class="content">
           <div class="content_text">
               <a href="">${replyItem.username}<span class="onlyForSm">：<br></span></a>
               <span>${replyItem.content}</span>
           </div>
           <div class="content_info">
               <span class="reply_time">${replyItem.create_time}</span>
           </div>
       </div>
       ${control}
    </div>`;
        $('#replyList').append(html)
            //註冊控制面板相關功能
        if (id) {
            console.log(id)
            let btn = `#control_btn_${replyItem._id}`
            let ui = `#control_ui_${id}`
            $(btn).on('click', () => {
                $(ui).toggle()
            })

            let deleteID = `#reply_delete_${id}`
            $(deleteID).on('click', () => {
                if (confirm('確定要刪除嗎？')) {
                    delete_reply(id)
                }

            })
        }

    }

    function post_reply() {
        FormData = {
            which_comment: $('#article_id').val(),
            author: $('#user_id').val(),
            content: $('#reply_input').val()
        }
        $.ajax({
            url: '/reply',
            type: 'post',
            datatype: 'json',
            data: FormData
        }).done(function(res) {
            replyItem = res.reply
            replyItem.headimg = $('#user_headimg').attr('src')
            replyItem.username = $('#user_username').text()
            replyItem.content = $('#reply_input').val()
            replyItem.create_time = new Date().toLocaleString(undefined, {
                hour12: false
            })
            renderReply(replyItem)
            $('#reply_input').val('')
        }).fail(function(err) {
            alert('網路忙線中，請稍後再試')

        })
    }

    //隱藏留言列表，只顯示後3個
    function hideReply() {
        $('#hide_reply').hide()
        $('#show_reply').show()
        if ($('.reply__item').length < 4) return
        for (let i = 0; i < $('.reply__item').length - 3; i++) {
            $('.reply__item').eq(i).hide()
        }
    }
    //打開留言列表
    function showReply() {
        $('#show_reply').hide()
        $('#hide_reply').show()
        if ($('.reply__item').length < 4) return
        for (let i = 0; i < $('.reply__item').length; i++) {
            $('.reply__item').eq(i).show()
        }
    }

    $('#show_reply').on('click', () => {
        showReply()
    })
    $('#hide_reply').on('click', () => {
        hideReply()
    })

    //提交留言
    $('#reply_input').on('keydown', function(e) {
        if (e.keyCode === 13) {
            post_reply()
        }
    })

    { /* <i class="fa fa-ellipsis-v"> */ }
    //渲染留言控制面板
    function controlReply(replyItem) {
        let control = `<div class="control">
        <button id="control_btn_${replyItem._id}">
          <i class="fa fa-ellipsis-v"></i>
          <div id="control_ui_${replyItem._id}" class="control_ui"   style="display: none">
            <a href="javascript:;" id="reply_delete_${replyItem._id}">
                <i class="fa fa-trash-o" aria-hidden="true"></i> 刪除留言
            </a>
          </div>
        </button>
        
    </div>`;
        let id = replyItem._id
        return { control, id }
    }

    function delete_reply(id) {
        $.ajax({
            url: '/reply?id=' + id,
            type: 'delete',
            datatype: 'json'
        }).done(function(res) {
            if (res.err_code === 0) {
                $('#' + id).remove()
            }
        }).fail(function(err) {

        })
    }


    //初始化，取得留言列表
    getReply()
    $('#reply_delete_5de0fd6f062b401fd03151d3').click(() => {
        console.log('有' + id)
    })


    //按讚相關
    $('#like').on('click', () => {
        $.ajax({
            url: '/like?id=' + $('#article_id').val(),
            method: 'get',
            datatype: 'json',
            data: {}
        }).done(function(res) {

            console.log(res)
            if (res.err_code == 503) {
                return location.href = '/login'
            }
            $('#like').toggleClass('active');
        }).fail(function(err) {
            console.log('錯誤' + err)

        })


    })
















    $('#share_fb').on('click', () => {
        window.open("https://www.facebook.com/sharer/sharer.php?u=" + location.href, "分享到臉書", "width=340,height=163,toolbar=no,status=no,resize=no")
    })
    $('#share_line').on('click', () => {
        window.open("https://social-plugins.line.me/lineit/share?url=&text=" + location.href, "分享到LINE", "width=340,height=163,toolbar=no,status=no,resize=no")
    })




})($)