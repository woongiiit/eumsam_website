from jinja2 import Template

def get_welcome_email_template():
    """회원가입 환영 이메일 템플릿"""
    return Template("""
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>동국대학교 음샘 가입 완료</title>
    <style>
        body { font-family: 'Pretendard', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 동국대학교 중앙 밴드동아리 음샘에 오신 것을 환영합니다!</h1>
        </div>
        <div class="content">
            <h2>안녕하세요, {{ real_name }}님!</h2>
            <p>음샘에 가입해주셔서 감사합니다.</p>
            
            <h3>📋 가입 정보</h3>
            <ul>
                <li><strong>이름:</strong> {{ real_name }} ({{ username }})</li>
                <li><strong>이메일:</strong> {{ email }}</li>
                {% if student_id %}<li><strong>학번:</strong> {{ student_id }}</li>{% endif %}
                {% if major %}<li><strong>전공:</strong> {{ major }}</li>{% endif %}
            </ul>
            
            <h3>⏳ 다음 단계</h3>
            <p>현재 관리자 승인을 기다리고 있습니다. 승인까지 1-2일 정도 소요될 수 있습니다.</p>
            <p>승인 후에는 다음 기능들을 이용하실 수 있습니다:</p>
            <ul>
                <li>커뮤니티 게시판 글쓰기</li>
                <li>갤러리 업로드</li>
                <li>입부 지원</li>
            </ul>
            
            <p>궁금한 사항이 있으시면 언제든 연락주세요!</p>
            
            <a href="http://localhost:3000" class="button">음샘 홈페이지 방문하기</a>
        </div>
        <div class="footer">
            <p>동국대학교 중앙 밴드 동아리 음샘 | 대학교 학생회관 4층</p>
            <p>이메일: eumsaem@university.ac.kr | 전화: 010-1234-5678</p>
        </div>
    </div>
</body>
</html>
    """)

def get_approval_email_template():
    """승인 완료 이메일 템플릿"""
    return Template("""
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>동국대학교 음샘 가입 승인 완료</title>
    <style>
        body { font-family: 'Pretendard', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 축하합니다! 가입이 승인되었습니다!</h1>
        </div>
        <div class="content">
            <div class="success">
                <strong>🎵 {{ real_name }}님의 음샘 밴드 동아리 가입이 승인되었습니다!</strong>
            </div>
            
            <h2>환영합니다!</h2>
            <p>이제 음샘의 모든 활동에 참여하실 수 있습니다.</p>
            
            <h3>🎯 이용 가능한 기능</h3>
            <ul>
                <li><strong>커뮤니티 게시판:</strong> 칭찬글, 정보글, 세션구인 등 자유로운 소통</li>
                <li><strong>갤러리:</strong> 공연, MT, 연습 사진과 영상 공유</li>
                <li><strong>입부 신청:</strong> 동아리에 입부하고 싶은 분들을 위한 신청</li>
                <li><strong>다양한 활동:</strong> 정기 연습, 공연, MT 등</li>
            </ul>                      
            
            <p>함께 멋진 음악을 만들어가요! 🎸🎹🥁🎤</p>
            
            <a href="http://localhost:3000" class="button">음샘 홈페이지 방문하기</a>
        </div>
        <div class="footer">
            <p>동국대학교 중앙 밴드 동아리 음샘 | 대학교 학생회관 4층</p>            
        </div>
    </div>
</body>
</html>
    """)

def get_application_approval_email_template():
    """입부신청 승인 이메일 템플릿"""
    return Template("""
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>동국대학교 음샘 입부 승인 완료</title>
    <style>
        body { font-family: 'Pretendard', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 입부 신청이 승인되었습니다!</h1>
        </div>
        <div class="content">
            <div class="success">
                <strong>🎵 {{ real_name }}님의 입부 신청이 승인되었습니다!</strong>
            </div>
            
            <h2>음샘의 정식 멤버가 되신 것을 축하드립니다!</h2>                                   

            <h3>📞 연락처</h3>
            <p>궁금한 사항이 있으시면 언제든 연락주세요!</p>            
            
            <p>함께 멋진 음악을 만들어가요! 🎸🎹🥁🎤</p>
            
            <a href="http://localhost:3000" class="button">음샘 홈페이지 방문하기</a>
        </div>
        <div class="footer">
            <p>동국대학교 중앙 밴드 동아리 음샘 | 대학교 학생회관 4층</p>            
        </div>
    </div>
</body>
</html>
    """)
