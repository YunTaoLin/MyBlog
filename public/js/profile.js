(function($) {

    //表格切換

    $('#myTab a').click(function(e) {
        e.preventDefault()
        $(this).tab('show')
    });

    // --------個人簡介------------------------------------

    $('#about_edit_btn').on('click', () => {
        $('#about_content').hide()
        $('#about_edit_from').show()
        $('#about_edit_btn').hide()
    })

    $('#about_edit_cancel').on('click', () => {
        $('#about_edit_from').hide()
        $('#about_content').show()
        $('#about_edit_btn').show()
    })

    //發送ajax修改內容
    $('#about_edit_submit').on('click', () => {
        let bio = $('#about_text').val()
        $.ajax({
            url: '/updateAbout',
            type: 'post',
            datatype: 'json',
            data: {
                bio: bio
            }
        }).done(function(res) {
            console.log(res)
            if (res.err_code == 0) {
                bio = bio.replace(/\n/g, '<br>')
                $('#about_content').html(bio)
                $('#about_edit_from').hide()
                $('#about_content').show()
                $('#about_edit_btn').show()
            } else {
                alert('伺服器忙線中，請稍後再試')
            }

        })
    })

    // --------基本資訊------------------------------------

    $('#profile_edit_btn').on('click', () => {
        $('#profile_content').hide()
        $('#profile_edit_form').show()
        $('#profile_edit_btn  i').hide()
    })

    $('#profile_edit_cancel').on('click', (e) => {
        e.preventDefault()
        $('#profile_edit_form').hide()
        $('#profile_content').show()
        $('#profile_edit_btn i').show()
    })

    //發送ajax修改內容
    $('#profile_edit_form').on('submit', function(e) {
        e.preventDefault()
        let formData = $(this).serialize()
        console.log(JSON.stringify(formData))
        $.ajax({
            url: '/updateProfile',
            type: 'post',
            datatype: 'json',
            data: formData
        }).done((res) => {
            if (res.err_code == 0) {
                let username = $('input[name=username]').val()
                let email = $('input[name=email]').val()
                let gender = $('input[name=gender]:checked').val()
                if (gender == 1) {
                    gender = '男'
                } else if (gender == 0) {
                    gender = '女'
                } else {
                    gender = '保密'
                }
                let otherEmail = $('input[name=otherEmail]').val()
                $('#username').html(username)
                $('#email').html(email)
                $('#gender').html(gender)
                $('#otherEmail').html(otherEmail)
                $('#profile_edit_form').hide()
                $('#profile_content').show()
                $('#profile_edit_btn i').show()
            } else {
                alert('伺服器忙線中，請稍後再試')
            }

        })
    })

    // --------聯絡資訊------------------------------------

    // ---github-------------------
    $('#github_edit_btn').on('click', () => {
        $('#github_content').hide()
        $('#github_edit_form').show()
        $('#github_edit_btn').hide()
    })

    //ajax提交
    $('#github_edit_submit').on('click', () => {
        let setting = $('#github').val()
        $.ajax({
            url: '/updateGithub',
            type: 'post',
            datatype: 'json',
            data: {
                data: setting
            }
        }).done(function(res) {
            if (res.err_code == 0) {
                $('#github_content').text(setting)
                $('#github_content').show()
                $('#github_edit_form').hide()
                $('#github_edit_btn').show()
            } else {
                alert('伺服器忙線中，請稍後再試')
            }

        }).fail(function(err) {
            alert('伺服器忙線中，請稍後再試')

        })
    })



    //----fb------------------------
    $('#fb_edit_btn').on('click', () => {
        $('#fb_content').hide()
        $('#fb_edit_form').show()
        $('#fb_edit_btn').hide()
    })

    //ajax提交
    $('#fb_edit_submit').on('click', () => {
        let setting = String($('#fb').val())
        $.ajax({
            url: '/updateFb',
            type: 'post',
            datatype: 'json',
            data: {
                data: setting
            }
        }).done(function(res) {
            if (res.err_code == 0) {
                $('#fb_content').text(setting)
                $('#fb_content').show()
                $('#fb_edit_form').hide()
                $('#fb_edit_btn').show()
            } else {
                alert('伺服器忙線中，請稍後再試')
            }
        }).fail(function(err) {
            alert('伺服器忙線中，請稍後再試')
        })
    })


    //----twitter------------------------
    $('#twitter_edit_btn').on('click', () => {
        $('#twitter_content').hide()
        $('#twitter_edit_form').show()
        $('#twitter_edit_btn').hide()
    })

    //ajax提交
    $('#twitter_edit_submit').on('click', () => {
        let setting = $('#twitter').val()
        $.ajax({
            url: '/updateTwitter',
            type: 'post',
            datatype: 'json',
            data: {
                data: setting
            }
        }).done(function(res) {
            if (res.err_code == 0) {
                $('#twitter_content').text(setting)
                $('#twitter_content').show()
                $('#twitter_edit_form').hide()
                $('#twitter_edit_btn').show()
            } else {
                alert('伺服器忙線中，請稍後再試')
            }
        }).fail(function(err) {
            alert('伺服器忙線中，請稍後再試')

        })
    })


    //------phone------------------------
    $('#phone_edit_btn').on('click', () => {
        $('#phone_content').hide()
        $('#phone_edit_form').show()
        $('#phone_edit_btn').hide()
    })

    //ajax提交
    $('#phone_edit_submit').on('click', () => {
        let setting = $('#phone').val()
        $.ajax({
            url: '/updatePhone',
            type: 'post',
            datatype: 'json',
            data: {
                data: setting
            }
        }).done(function(res) {
            if (res.err_code == 0) {
                $('#phone_content').text(setting)
                $('#phone_content').show()
                $('#phone_edit_form').hide()
                $('#phone_edit_btn').show()
            } else {
                alert('伺服器忙線中，請稍後再試')
            }
        }).fail(function(err) {
            alert('伺服器忙線中，請稍後再試')
        })
    })



    // //更換大頭照
    $('#upload_img').on('change', () => {
        $('#upload_img_form').trigger('submit')
    })

    // $('#upload_img_form').on('submit', function(e) {
    //     e.preventDefault()
    //     let formData = $(this).serialize()
    //     console.log(formData)
    // })




})($)