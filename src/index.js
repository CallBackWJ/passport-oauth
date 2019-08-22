//express
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");

//passport
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//순서 중요 passport의 세션이 내부적으로 express-session을 사용하기 때문에 항상 먼저 express-session를 등록해줘야 한다.
app.use(
  session({
    secret: "비밀스런 세션",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());//passport 초기화
app.use(passport.session());//로그인 세션 사용을 위한 세션 설정

//로그인에 성공할 시 serializeUser 메서드를 통해서 사용자 정보를 Session에 저장
passport.serializeUser(function(user, done) {
    console.log('serializeUser');
  done(null, user);
});

//인증이 완료되고 페이지 이동시 deserializeUser 메서드가 호출
passport.deserializeUser(function(obj, done) {
    console.log('deserializeUser');
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID:"당신의 아이디",
      clientSecret: "당신의 비밀코드",
      callbackURL: "http://localhost:4000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      //console.log(profile);
      return done(null, profile);
    }
  )
);

//라우팅
app.get("/", (req, res) => {
  res.send(
    `hello passport <br/><a href='/login'>로그인</a><br/><a href='/logout'>로그아웃</a><br/><a href='/protected'>개인정보</a><br/>${req.user&&req.user.displayName}<br/>`
  );
});
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
app.get(
  "/login",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login"]
  })
);

//콜백 리다이렉트를 받을 라우터
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/");
  }
);
//////////////////////////////


const accessProtectionMiddleware = (req, res, next) => {  
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(403).json({
        message: 'must be logged in to continue',
      });
    }
  };  
  app.get('/protected', accessProtectionMiddleware, (req, res) => {  
    res.json({
      message: '권한이 있습니다.',
      yourUserInfo: req.user,
    });
  });


app.listen(4000);
