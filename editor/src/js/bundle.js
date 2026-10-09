(function() {
  'use strict';

  // 1. Embedded Game Data
  const GAME_DATA = {"CHRcorps": {"0": "없음", "2": "일반병", "3": "일반병", "4": "바루스슬레이어", "5": "루나스군단", "6": "코어헌터", "7": "가이아버그즈", "8": "네트메카닉군단", "9": "현혹령군단", "10": "우주다하카", "12": "네트군단", "13": "미네랄군단", "14": "가이라리더", "15": "아벨리안군단", "16": "레즈스탕스1", "17": "레지스탕스2", "18": "블랙스피어스", "19": "글로리가드", "20": "아델룬1", "21": "아델룬2", "22": "아델룬3", "23": "강화병1", "24": "강화병2", "25": "강화병3", "26": "세큐리티볼", "27": "슬라임", "28": "준코부대", "29": "로드군단", "30": "페이온군단", "31": "스트라이커즈", "32": "우주해적단", "33": "전함크루1", "34": "전함크루2", "35": "전함크루3", "36": "우주말벌떼", "37": "페르소광신도들", "38": "구룡방원", "39": "글로리 마스터", "40": "팡테온", "41": "시리우스해적단", "42": "볼군단", "43": "슬라임3형제", "44": "은빛갈기", "45": "베델친위대", "46": "메트로스일반", "47": "메트로스장교", "48": "연구원", "49": "시즈", "50": "강화 안드로이드 군단", "51": "육갑전사", "52": "브레인엠티군단", "53": "세큐리티볼군단", "54": "세큐리티볼군단", "55": "글로리가드", "56": "글로리가드", "57": "슬라임", "58": "팡테온", "59": "팡테온", "60": "글로리마스터", "61": "일반길드", "62": "메트로스일반", "63": "슈 & 진", "64": "소울가딘어즈", "65": "강화병1", "66": "강화병1", "67": "제드군단", "68": "영 페이온", "69": "구룡방", "70": "레드해커즈", "71": "메트로스삼인방", "72": "페이온군단", "73": "로드군단", "74": "해커", "75": "블랙스피어스", "77": "팬널"}, "attype": {"1": "근거리공격", "6": "원거리공격", "1479": "부스터"}, "chrabil": {"0": "연", "1": "파", "2": "비", "3": "살", "4": "혼", "5": "폭", "6": "광(사용못함)", "7": "오버드라이브", "8": "힐", "9": "격려", "10": "큐어", "11": "포스필드", "12": "희생", "13": "오버플로우", "14": "리미트플로우", "15": "프레셔", "16": "메테오스트라이크", "17": "포스리젼", "18": "비연참", "19": "소닉블레이드", "20": "풍아열공참", "21": "익스플로젼", "22": "헤비프레셔", "26": "더블브레이크(아셀라스)", "27": "소울블레스트", "28": "엘레멘탈파이어", "29": "카운터블레이드", "30": "블레이드미사일", "31": "사신의 분노", "33": "일루션히트", "34": "소울스트라이크", "35": "마인드어택", "36": "하이텔레포트", "37": "텔레파시(사용못함)", "38": "쇼크", "39": "브레인스톰", "40": "배리어", "41": "아디지오", "42": "프레스토", "43": "퍼니피(사용못함)", "44": "리미트크래쉬", "45": "리미트캐스트", "46": "마인드컨트롤", "47": "마인드체인지", "48": "파워드배리어", "49": "브레인브레이크", "50": "일루션컨트럴(사용못함)", "51": "오버테이크", "52": "올퍼니피(사용못함)", "53": "익스퍼트웨이브", "54": "익스퍼트블레스트", "55": "엘레멘탈아이스", "56": "엘레멘탈썬더", "57": "엘레멘탈라이트", "58": "리인카네이션", "59": "서몬몬스터", "60": "리콜", "61": "엘레멘탈실드", "62": "엘레멘탈라이트닝(사용못함)", "63": "엘레멘탈다크", "64": "하드밸런싱", "65": "소프트밸런싱", "66": "엘레멘탈베이스", "68": "락킹필드", "69": "포이즌", "70": "기가실드", "71": "파이어웨이브", "72": "라이트닝샤벨", "73": "어스퀘이크", "74": "썬더스톰", "75": "블리자드", "76": "카운터스피어", "77": "카운터미사일", "78": "아스트럴파이어", "79": "엘레멘탈버스터", "80": "웨폰크래쉬", "81": "에네르기힐(사용못함)", "82": "아스트럴실드", "83": "사이킥크로스", "84": "캐노피", "85": "피드백", "86": "아스트럴애로우", "87": "아스트럴블레이드", "88": "카운터붐", "89": "파이널버스터", "90": "아스트럴필드", "91": "리바이블", "92": "와이드힐", "93": "크래쉬붐", "94": "메테오", "95": "다이나믹크래쉬", "96": "커스", "97": "카운터실드", "98": "워큰드아머", "99": "파워드아머", "100": "파워다운", "101": "파워업", "102": "스피드업", "103": "스피드다운", "104": "페스트렉", "105": "카피렉", "106": "블라인드", "107": "안티벨런싱", "108": "코메트(사용못함)", "109": "그라비티필드", "110": "그라비티벨런스", "111": "블레이드샤워", "112": "카운터필드", "113": "언벨런싱(사용못함)", "114": "블랙홀", "115": "미라클", "116": "워핑", "117": "방어", "118": "회피", "121": "오메가스윙", "122": "공폭탄", "123": "헬카이트", "124": "Hunter(사용못함)", "125": "크레이지 샷(크리스티앙)", "126": "진 풍아열공참(죠안)", "127": "초능력공격", "138": "나인크루세이더(디에네)", "139": "다크스크림(마리아)", "140": "리커버리", "141": "리제너레이션", "142": "엘레멘탈힐", "143": "힐윈드", "144": "사이킥 드라이브", "145": "셰틀라이트 어택", "146": "버닝웜", "147": "타이타니아 슈발츠", "148": "코메트", "149": "페이온 스피리츠(리엔)", "150": "무신멸뢰옥(유진)", "151": "LP증가", "154": "SOUL증가", "155": "DEP증가", "156": "TP증가", "157": "PSY증가", "158": "인페르노", "159": "폭주(베라모드)", "160": "이스케이프", "161": "레이져공격(사용못함)", "162": "천지파열무(살라딘)", "163": "진무 천지파열(살라딘)", "164": "아수라파천무(베라모드, 살라딘)", "165": "빅뱅(리챠드)", "166": "밍밍 스페셜(네리사)", "167": "선 블래스트(란)", "168": "데스포토그래프(루시엔)", "169": "폭풍검(샤크바리)", "170": "이데아캐논(살라딘)", "171": "헬레이져", "172": "아이템_테스트(사용못함)", "173": "영혼의집중", "174": "소울스트림", "175": "대검연마법", "176": "광마육혈포", "177": "반사광증폭", "178": "구룡금나수", "179": "발키리의혼", "180": "루나무음보법", "181": "기자근성", "182": "밍밍조련술", "183": "머독폭파술", "184": "화령제렴술", "185": "템페스트", "186": "회색의 잔영", "187": "강림의 밤", "188": "서풍의 광시곡", "189": "레드 크로스", "190": "아지다하카 전술 Mk-II", "191": "월광의 살육", "192": "블랙 이클립스"}, "chrbody": {"0": "없음", "18": "코어헌터(주황)", "21": "광원(파랑, 소)", "23": "엑토플라즘(사람)", "53": "광원(파랑, 소)", "55": "아셀라스", "58": "대화모습(네리사, 보통)", "59": "카르마타(2)", "61": "대화모습(살리딘, 보통)", "62": "대화모습(죠안, 보통)", "63": "대화모습(크리스티앙, 보통)", "67": "크리스티앙(2)", "74": "광원(주황, 소)", "78": "전함승무원", "117": "세큐리티볼", "130": "전함승무원(2)", "144": "전함승무원(3)", "150": "전함승무원(4)", "162": "스파이더", "165": "장교", "198": "일반병사", "202": "샤크바리", "212": "쥰코", "228": "일반병사(2)", "238": "길드원", "239": "전함승무원(5)", "240": "길드원(2)", "241": "길드원(3)", "242": "길드원(4)", "243": "길드원(5)", "256": "데미안", "315": "카르마타", "323": "크리스티앙", "338": "죠안", "347": "살라딘", "350": "바루스", "365": "가이아버그", "366": "현혹령", "367": "가이아리더", "368": "제이슨", "392": "엠블라", "417": "아지다하카", "424": "스턴", "439": "살라딘(2)", "441": "죠안(2)", "506": "베라모드", "507": "베라모드(2)", "536": "이반", "540": "칼리오페", "551": "라이더", "554": "세큐리티볼(2)", "557": "우주말벌", "563": "우주슬라임", "566": "슬라임3형제", "567": "디에네", "570": "란", "572": "마리아", "582": "리차드", "597": "아슈레이", "641": "카를로스", "649": "루크랜서드", "707": "은빛갈기", "708": "은빛갈기(2)", "709": "은빛갈기(3)", "714": "해적", "715": "해적(2)", "716": "해적(3)", "720": "일반병사(3)", "723": "길드원(6)", "732": "길드원(7)", "753": "아수라수호신", "841": "길드원(8)", "842": "일반병사(4)", "843": "일반병사(5)", "845": "일반병사(6)", "847": "글로리 가드", "849": "글로리 가드(2)", "852": "글로리 가드(3)", "853": "글로리 가드(4)", "856": "글로리 가드(5)", "858": "글로리 가드(6)", "859": "마스터", "862": "팡테온가드", "863": "장교(2)", "899": "네리사", "900": "유진", "903": "루시엔", "946": "아델룬1", "947": "강화아델룬", "948": "강화아델룬(2)", "949": "아돌", "951": "강화아델룬(3)", "955": "아델룬2", "956": "아델룬장교", "957": "아델룬1(2)", "1007": "아만딘", "1008": "무녀", "1010": "과학자", "1011": "과학자(2)", "1012": "과학자(3)", "1013": "과학자(4)", "1017": "리엔", "1023": "블랙스피어스", "1028": "은빛갈기(4)", "1030": "해적(4)", "1034": "해적(5)", "1051": "로드", "1054": "페이온", "1055": "로드(2)", "1057": "로드(3)", "1058": "발룬티어시민", "1060": "로드(4)", "1061": "로드(5)", "1064": "페이온(2)", "1065": "슬럼가 주민", "1066": "슬럼가 주민(2)", "1067": "발룬티어시민(2)", "1096": "레드헤드", "1102": "해커", "1103": "해커(2)", "1111": "팡테온가드(2)", "1112": "팡테온가드(3)", "1113": "팡테온가드(4)", "1114": "마스터(2)", "1115": "마스터(3)", "1121": "아델룬1(3)", "1125": "강화아델룬(4)", "1126": "강화병1", "1127": "강화아델룬(5)", "1128": "강화아델룬(6)", "1129": "강화아델룬(7)", "1130": "강화병2", "1131": "강화병3", "1132": "강화아델룬(8)", "1133": "아벨리안교관", "1134": "아벨리안", "1135": "아벨리안(2)", "1137": "블랙스피어스(2)", "1139": "블랙스피어스(3)", "1140": "블랙스피어스(4)", "1144": "구룡방원", "1145": "페이온(3)", "1147": "구룡방원(2)", "1148": "구룡방원(3)", "1152": "루나스", "1153": "루나스권법가", "1155": "루나스(2)", "1165": "하이델룬", "1166": "슈", "1167": "진", "1182": "장교(3)", "1183": "장교(4)", "1185": "살라딘(3)", "1205": "디에네(2)", "1218": "나탈리", "1226": "베델친위대", "1227": "베델친위대(2)", "1228": "베델친위대(3)", "1229": "광신도", "1231": "광신도(2)", "1239": "브레인엠티", "1240": "엘더마스터", "1243": "데미안", "1250": "안드로이드", "1259": "손나딘", "1274": "리벤", "1278": "유블레인", "1304": "켄", "1305": "카렐라", "1306": "테오렐", "1307": "레제드람", "1308": "루칼드", "1309": "로브", "1310": "바룬", "1342": "삭신"}, "chrface": {"0": "없음", "229": "UNKNOWN", "362": "아돌", "364": "필그림(여)", "408": "카렐라", "433": "제이슨", "454": "아지다하카", "573": "칼리오페", "574": "이반", "655": "네리사", "656": "디에네", "657": "데미안", "658": "란", "659": "레드헤드", "668": "리엔", "669": "리차드", "671": "마리아", "672": "바룬", "673": "베라모드", "674": "살라딘", "675": "샤크바리", "676": "아셀라스", "677": "아슈레이", "679": "엠블라", "685": "죠안", "686": "카를로스", "688": "크리스티앙", "751": "루크랜서드", "756": "유진", "759": "아만딘", "762": "진", "766": "슈", "781": "손나딘", "789": "루시엔", "974": "나탈리", "1047": "유블레인", "1052": "하이델룬", "1078": "해커", "1080": "스턴(코어헌터)", "1081": "로브", "1082": "루칼드", "1084": "로드", "1085": "아델룬", "1086": "켄", "1087": "해적", "1088": "엘더마스터", "1089": "광신도", "1092": "무녀", "1101": "바루스", "1110": "테오렐", "2004": "우주말벌", "2323": "슬라임3형제"}, "chrjob": {"0": "없음", "951": "코어 헌터", "1219": "변충류", "1291": "엑토플라즘", "1292": "귀묘류", "1293": "북두괴류", "1294": "괴수령류", "1295": "포유류", "1296": "무직", "1297": "우주해적", "1399": "학생", "1672": "젤류", "1673": "세큐리티볼", "1674": "스파이더", "1675": "라이더", "1679": "로드", "1680": "제드", "1681": "페이온", "1685": "아델룬", "1688": "술집주인", "1747": "마스터", "1897": "무녀", "1986": "아벨리안", "1987": "아르케 중앙군", "1988": "기자", "1989": "연구소장", "1990": "루나스", "1991": "길드리더", "1992": "보좌관", "1994": "베델", "1995": "장교", "1996": "해적", "1997": "그레이팬텀", "1998": "교주", "2001": "하이델룬", "2002": "팡테온 가드", "2003": "전함승무원", "2124": "구룡방원", "2153": "주민", "2244": "블랙스피어스", "2245": "은빛갈기", "2246": "길드원", "2247": "발룬티어시민", "2248": "슬럼주민", "2250": "보아즈교도", "2251": "연구원", "2252": "해커", "2253": "아벨리안", "2254": "아벨리안교관", "2255": "일반병사", "2256": "글로리가드", "2257": "베델친위대", "2258": "안드로이드", "2259": "강화아델룬", "2347": "소매치기"}, "chrname": {"0": "없음", "27": "나탈리", "30": "네리사", "228": "데미안", "229": "디에네", "437": "란", "443": "레드헤드", "449": "레제드람", "450": "로브", "451": "루시엔", "452": "루칼드", "455": "리벤", "456": "리엔", "458": "마리아", "459": "리차드", "460": "바룬", "462": "베라모드", "463": "살라딘", "464": "손나딘", "466": "아만딘", "467": "아셀라스", "468": "아슈레이", "470": "엠블라", "471": "유블레인", "472": "유진", "474": "제이슨", "475": "죠안", "477": "카를로스", "478": "칼리오페", "479": "크리스티앙", "480": "테오렐", "637": "코어헌터", "638": "블랙스피어스", "640": "루나스", "642": "엘더마스터", "643": "과학자", "644": "아벨리안", "646": "일반병사", "647": "장교", "648": "안드로이드", "652": "아델룬장교", "654": "팡테온가드", "655": "전함승무원", "661": "스파이더", "662": "라이더", "785": "해커", "786": "무녀", "790": "마스터", "946": "가이아버그", "947": "바루스", "948": "쥰코", "949": "카르마타", "952": "스턴", "955": "가이아리더", "1071": "현혹령", "1075": "아지다하카", "1198": "필그림", "1574": "이반", "1575": "로드", "1581": "브레인엠티", "1583": "광신도", "1620": "글로리 가드", "1621": "아델룬1", "1622": "아델룬2", "1627": "강화병1", "1628": "강화병2", "1629": "강화병3", "1630": "세큐리티볼", "1648": "켄", "1671": "페이온", "1692": "루크랜서드", "1898": "슈", "1899": "진", "1943": "샤크바리", "1999": "하이델룬", "2005": "우주슬라임", "2123": "구룡방원", "2222": "카렐라", "2241": "슬럼가 주민", "2252": "해커", "2274": "아돌", "2314": "블랙스피어스", "2315": "은빛갈기", "2316": "길드원", "2317": "발룬티어시민", "2319": "연구원", "2321": "글로리가드", "2322": "강화아델룬", "2324": "베델친위대", "2329": "해적", "2343": "아수라수호신", "2368": "루이스", "2392": "젠", "2423": "슈로 위장한 진", "2599": "삭신", "2604": "스턴의 부하들", "2605": "루나스권법가", "2623": "도리도리"}, "chrvoc": {"0": "없음", "1": "죠안", "2": "제이슨", "3": "블랙스피어스(해골, 유령)", "4": "해적", "5": "진(슈)", "6": "아만딘", "7": "칼리오페", "12": "나탈리", "13": "네리사", "14": "데미안", "15": "디에네", "16": "레드헤드", "17": "루시엔", "18": "루크랜서드", "19": "리엔", "20": "리차드", "21": "마리아", "22": "베라모드", "23": "살라딘", "24": "샤크바리", "25": "아셀라스", "26": "엠블라", "27": "유진", "28": "카를로스", "30": "란", "32": "크리스티앙", "33": "하이델룬", "34": "아슈레이", "35": "베라모드(마에라드)", "36": "현혹령", "37": "쥰코", "38": "아수라수호신"}, "itemar": {"0": "없음", "70": "바운서 EXP", "71": "바운서 BAL", "72": "레더아머", "73": "세라믹 아머", "74": "클래식 아머", "75": "클래식 EXP", "76": "클래식 PLUS", "77": "애쓸릿 어버", "78": "파워 아머", "79": "파워 EXP", "80": "엘란듐 아머", "81": "크로슬리 페일러", "82": "아크 아머", "161": "아크론 아머", "177": "바운서"}, "itembelt": {"0": "없음", "90": "가죽벨트", "91": "체인벨트", "92": "아이언벨트", "93": "램버트벨트", "94": "제쿨트벨트", "163": "스톤의 벨트"}, "itemneck": {"0": "없음", "102": "그라톡스", "103": "미라쥐", "104": "천신경", "105": "플레임블라스"}, "itemring": {"0": "없음", "96": "금반지", "97": "루비반지", "98": "다이아반지", "99": "램버트반지", "100": "코어반지", "165": "천사의 선물"}, "itemshoe": {"0": "없음", "84": "등산화", "85": "군화", "86": "파워드 슈즈", "87": "램버트 슈즈", "88": "라이트닝 슈즈", "162": "영자신발"}, "itemwp": {"0": "없음", "1": "옐로리본", "2": "블루리본", "3": "화이트리본", "4": "레드리본", "5": "실버리본", "6": "골드리본", "7": "플라티늄리본", "10": "베이직 휠", "11": "체리오트 휠", "12": "파이어 휠", "13": "써니 휠", "15": "글래스 렌즈", "16": "옵틱 써클", "17": "프라임 렌즈", "18": "언터쳐블 렌즈", "20": "베이직 크로", "21": "쎄라믹 크로", "22": "아이언 크로", "23": "크리스탈 크로", "25": "어씨스터", "26": "듀얼 레이져", "27": "굿 펠리스", "28": "갈리디움 RX", "29": "트윈 블래스터", "30": "리볼버 발렌타인", "32": "마일드 스모크", "33": "쵸이스", "34": "헤비원", "35": "헤이즐 스모크", "36": "체인지 스모커", "37": "후버의 자존심", "38": "없음", "39": "B-포트", "40": "아이비 포트", "41": "스파이더 포트", "42": "스네이크 포트", "43": "해저드 포트", "45": "블루", "46": "튜터", "47": "토르트", "48": "레토르트", "49": "T-써클릿", "50": "S-써클릿", "51": "가리우스", "52": "G-써클릿", "53": "아이리스 써클릿", "54": "천원", "56": "수련검", "57": "키퍼", "58": "블릿츠", "59": "폴리커", "60": "가디안", "61": "장검", "62": "씨즈", "64": "큐티스톤", "65": "라이언 하트", "66": "소울 브레이커", "67": "어비스 블랙", "129": "스페이스 리버", "130": "펠레의 빙검", "131": "맘모스", "132": "트윌라잇 크로스", "134": "크림슨프리즘", "135": "바인드프리즘", "136": "헬프리즘", "137": "멜리사의 해골", "138": "악마의 문장", "140": "젤샤프란", "142": "쥬다스 요요", "144": "타이거 아이", "146": "여인의 키스", "148": "더 레이져", "150": "군터의 팔", "152": "스노우 화이트", "154": "멸살지옥검", "156": "발몽", "158": "일반검", "159": "일반총", "174": "인스트럭터", "178": "실버 CON", "197": "장총"}, "styleARK": {"102": "없음", "38": "아크로스트", "39": "아크로스트A", "40": "아크로스트D", "41": "아크로스트S", "42": "아크로스트H", "43": "아크즈마", "44": "아크즈마A", "45": "아크즈마D", "46": "아크즈마S", "47": "아크즈마H", "48": "아크마리엘", "49": "하스모헬리스"}, "styleOZM": {"102": "없음", "50": "오즈마", "51": "오즈마A", "52": "오즈마D", "53": "오즈마S", "54": "오즈마H", "55": "아크메이져", "56": "아크메이져A", "57": "아크메이져D", "58": "아크메이져S", "59": "아크메이져H", "60": "엘샤루핌", "61": "가프리스"}, "stylefor": {"102": "없음", "25": "포스트럴", "26": "포스트럴A", "27": "포스트럴D", "28": "포스트럴S", "29": "포스트럴H", "30": "오즈매트럴", "31": "오즈매트럴A", "32": "오즈매트럴D", "33": "오즈매트럴S", "34": "오즈매트럴H", "35": "아퀴루핌", "36": "루시 데르몬"}, "stylepsy": {"102": "없음", "1": "사이클론", "2": "사이클론A", "3": "사이클론D", "4": "사이클론S", "5": "사이클론H", "6": "오즈클론", "7": "오즈클론A", "8": "오즈클론D", "9": "오즈클론S", "10": "오즈클론H", "11": "레아틀론", "12": "이블 리스토"}, "styles": {"0": "없음", "1": "사이클론 1차", "2": "사이클론 2차", "3": "사이클론 3차", "4": "타키리온 1차", "5": "타키리온 2차", "6": "타키리온 3차", "7": "포스트럴 1차", "8": "포스트럴 2차", "9": "포스트럴 3차", "10": "아크로스트 1차", "11": "아크로스트 2차", "12": "아크로스트 3차", "13": "오즈마 1차", "14": "오즈마 2차", "15": "오즈마 3차"}, "styletak": {"102": "없음", "13": "타키리온", "14": "타키리온A", "15": "타키리온D", "16": "타키리온S", "17": "타키리온H", "18": "오즈리온", "19": "오즈리온A", "20": "오즈리온D", "21": "오즈리온S", "22": "오즈리온H", "23": "라키시엘", "24": "베엘제르크"}, "wpPic": {"0": "없음", "40": "MING-MING`S RIBBON", "41": "WING man", "42": "Nika AF - 1", "43": "Claw", "44": "Pistol", "45": "S&M 357", "47": "The Crusaders", "48": "Pure Snow", "49": "Buster Slicer", "50": "Core Stick", "51": "The Crusaders", "52": "Crosslie Custom", "53": "Booster", "54": "Asura", "55": "Cook SlicerIII", "56": "Sword", "57": "Broad Sword"}, "wptype": {"0": "크리슬로우(살라딘,디에네)", "1": "Booster (베라모드,엠블라)", "8": "MING-MING`S RIBBON (네리사)", "12": "Pistol (크리스티앙)", "13": "S&M 357 (리차드)", "14": "Sword (란, 죠안등)", "15": "Broad Sword (샤크바리, 유진)", "16": "Asura (살라딘, 폭주베라모드)"}};

  // 2. Data Manager
  const lookupCache = new Map();
  function getCategoryMap(category) {
    return GAME_DATA[category] || {};
  }

  function getLookupName(category, id, defaultVal = null) {
    const cacheKey = `${category}:${id}`;
    if (lookupCache.has(cacheKey)) return lookupCache.get(cacheKey);
    const map = getCategoryMap(category);
    let name = defaultVal !== null ? defaultVal : `알 수 없음 (${id})`;
    if (map && map[id] !== undefined) {
      name = map[id];
    } else if (map && map[String(id)] !== undefined) {
      name = map[String(id)];
    }
    lookupCache.set(cacheKey, name);
    return name;
  }

  function getCategoryOptions(category) {
    const map = getCategoryMap(category);
    const list = [];
    for (const [k, v] of Object.entries(map)) {
      list.push({ id: parseInt(k, 10), name: v });
    }
    list.sort((a, b) => a.id - b.id);
    return list;
  }

  // 3. Save Codec
  function decodeSaveBuffer(buffer) {
    const src = new Uint8Array(buffer);
    const len = src.byteLength;
    const decoded = new Uint8Array(len);
    const u32Count = Math.floor(len / 4);
    const src32 = new Uint32Array(buffer, 0, u32Count);
    const dec32 = new Uint32Array(decoded.buffer, 0, u32Count);
    for (let i = 0; i < u32Count; i++) {
      dec32[i] = ~src32[i] >>> 0;
    }
    const remainderStart = u32Count * 4;
    for (let i = remainderStart; i < len; i++) {
      decoded[i] = src[i] ^ 0xFF;
    }
    return decoded;
  }

  function calculateSaveChecksum(rawEncryptedBytes) {
    const n = rawEncryptedBytes.length - 2;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const mult = 2 * (i & 3) + 3;
      sum = (sum + rawEncryptedBytes[i] * mult) % 32000;
    }
    return sum;
  }

  function updateSaveChecksum(rawEncryptedBytes) {
    if (rawEncryptedBytes.length < 2) return rawEncryptedBytes;
    const checksum = calculateSaveChecksum(rawEncryptedBytes);
    const n = rawEncryptedBytes.length - 2;
    rawEncryptedBytes[n] = checksum & 0xFF;
    rawEncryptedBytes[n + 1] = (checksum >> 8) & 0xFF;
    return rawEncryptedBytes;
  }

  function encodeSaveBuffer(decodedBytes) {
    const encoded = decodeSaveBuffer(decodedBytes.buffer);
    return updateSaveChecksum(encoded);
  }

  function readUint16(bytes, offset) {
    return bytes[offset] | (bytes[offset + 1] << 8);
  }

  function writeUint16(bytes, offset, value) {
    bytes[offset] = value & 0xFF;
    bytes[offset + 1] = (value >> 8) & 0xFF;
  }

  function readUint32(bytes, offset) {
    return (
      (bytes[offset]) |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      ((bytes[offset + 3] << 24) >>> 0)
    );
  }

  function writeUint32(bytes, offset, value) {
    bytes[offset] = value & 0xFF;
    bytes[offset + 1] = (value >> 8) & 0xFF;
    bytes[offset + 2] = (value >> 16) & 0xFF;
    bytes[offset + 3] = (value >> 24) & 0xFF;
  }

  // 4. Save Parser (Dual format: 932-byte & 327-byte)
  const STRIDE_327 = 0x147;
  const STRIDE_932 = 0x3A4;
  const KNOWN_HERO_IDS = new Set([
    27, 30, 228, 229, 437, 443, 449, 450, 451, 452, 455, 456, 458, 459, 460, 462, 463, 464, 466,
    467, 470, 472, 475, 477, 479, 1170, 1171, 1173, 1692, 1943, 2392, 2423
  ]);

  const OFFSETS_327 = {
    ID: 0x000, ID_MIRROR: 0x0EA, LEVEL: 0x0EE, JOB: 0x0D8, STYLE: 0x0DC, CORPS: 0x0D6, AT_TYPE: 0x0D4,
    EXP: 0x130, HP_CUR: 0x136, HP_MAX: 0x13C, TP_CUR: 0x138, TP_MAX: 0x13E,
    EQUIP_WP: 0x100, EQUIP_AR: 0x102, EQUIP_NECK: 0x104, EQUIP_RING: 0x106, EQUIP_BELT: 0x108, EQUIP_SHOE: 0x10A
  };

  // Ground truth verified against Genesis 3 Part 2 save files
  const OFFSETS_932 = {
    ID: 0x000, ID_MIRROR: 0x002, JOB: 0x00A, STYLE: 0x00C, CORPS: 0x00E, AT_TYPE: 0x014,
    ATK: 0x024, LEVEL: 0x026, EXP: 0x02A, LP: 0x02E, PSY: 0x036, TP: 0x038, CTP: 0x03C, DEP: 0x03E, DEX: 0x040,
    EQUIP_WP: 0x046, EQUIP_AR: 0x048, EQUIP_NECK: 0x04A, EQUIP_RING: 0x04C, EQUIP_BELT: 0x04E, EQUIP_SHOE: 0x050
  };

  class CharacterRecord {
    constructor(rawBytes, startOffset, index, formatType = '327') {
      this.rawBytes = rawBytes;
      this.startOffset = startOffset;
      this.index = index;
      this.formatType = formatType;
      this.offsets = formatType === '932' ? OFFSETS_932 : OFFSETS_327;
      this.load();
    }

    load() {
      const o = this.startOffset;
      const b = this.rawBytes;
      const off = this.offsets;

      this.id = readUint16(b, o + off.ID);
      this.idMirror = readUint16(b, o + off.ID_MIRROR);
      this.level = readUint16(b, o + off.LEVEL);

      if (this.formatType === '932') {
        this.exp = readUint32(b, o + off.EXP);
        this.lp = readUint16(b, o + off.LP);
        this.hpCur = this.lp * 2;
        this.hpMax = this.lp * 2;
        this.tpCur = readUint16(b, o + off.TP);
        this.tpMax = this.tpCur;
        this.psy = readUint16(b, o + off.PSY);
        this.ctp = readUint16(b, o + off.CTP);
        this.dep = readUint16(b, o + off.DEP);
        this.dex = readUint16(b, o + off.DEX);
        this.atk = readUint16(b, o + off.ATK);
      } else {
        this.exp = off.EXP ? readUint32(b, o + off.EXP) : 0;
        this.hpCur = readUint16(b, o + off.HP_CUR);
        this.hpMax = readUint16(b, o + off.HP_MAX);
        this.tpCur = readUint16(b, o + off.TP_CUR);
        this.tpMax = readUint16(b, o + off.TP_MAX);
        this.lp = Math.round(this.hpCur / 2);
        this.psy = 0;
        this.ctp = 0;
        this.dep = 0;
        this.dex = 0;
        this.atk = 0;
      }

      this.job = readUint16(b, o + off.JOB);
      this.style = readUint16(b, o + off.STYLE);
      this.corps = readUint16(b, o + off.CORPS);
      this.atType = readUint16(b, o + off.AT_TYPE);

      this.equipWp = readUint16(b, o + off.EQUIP_WP);
      this.equipAr = readUint16(b, o + off.EQUIP_AR);
      this.equipNeck = readUint16(b, o + off.EQUIP_NECK);
      this.equipRing = readUint16(b, o + off.EQUIP_RING);
      this.equipBelt = readUint16(b, o + off.EQUIP_BELT);
      this.equipShoe = readUint16(b, o + off.EQUIP_SHOE);
    }

    save() {
      const o = this.startOffset;
      const b = this.rawBytes;
      const off = this.offsets;

      writeUint16(b, o + off.ID, this.id);
      writeUint16(b, o + off.ID_MIRROR, this.id);
      writeUint16(b, o + off.LEVEL, this.level);

      if (this.formatType === '932') {
        writeUint32(b, o + off.EXP, this.exp);
        const savedLp = this.lp > 0 ? this.lp : Math.round(this.hpCur / 2);
        writeUint16(b, o + off.LP, savedLp);
        writeUint16(b, o + off.TP, this.tpCur);
        if (off.PSY) writeUint16(b, o + off.PSY, this.psy || 0);
        if (off.CTP) writeUint16(b, o + off.CTP, this.ctp || 0);
        if (off.DEP) writeUint16(b, o + off.DEP, this.dep || 0);
        if (off.DEX) writeUint16(b, o + off.DEX, this.dex || 0);
        if (off.ATK) writeUint16(b, o + off.ATK, this.atk || 0);
      } else {
        if (off.EXP) writeUint32(b, o + off.EXP, this.exp);
        writeUint16(b, o + off.HP_CUR, this.hpCur);
        writeUint16(b, o + off.HP_MAX, this.hpMax);
        writeUint16(b, o + off.TP_CUR, this.tpCur);
        writeUint16(b, o + off.TP_MAX, this.tpMax);
      }

      writeUint16(b, o + off.JOB, this.job);
      writeUint16(b, o + off.STYLE, this.style);
      writeUint16(b, o + off.CORPS, this.corps);
      writeUint16(b, o + off.AT_TYPE, this.atType);

      writeUint16(b, o + off.EQUIP_WP, this.equipWp);
      writeUint16(b, o + off.EQUIP_AR, this.equipAr);
      writeUint16(b, o + off.EQUIP_NECK, this.equipNeck);
      writeUint16(b, o + off.EQUIP_RING, this.equipRing);
      writeUint16(b, o + off.EQUIP_BELT, this.equipBelt);
      writeUint16(b, o + off.EQUIP_SHOE, this.equipShoe);
    }
  }

  class SaveFile {
    constructor(decodedBytes) {
      this.decodedBytes = decodedBytes;
      this.characters = [];
      this.formatType = 'unknown';
      this.tableStartOffset = 0;
      this.stride = 0;
      this.inventoryStore = null;
      this.parseCharacters();
      if (typeof window !== 'undefined' && window.G3Inventory && window.G3Inventory.InventoryStore) {
        this.inventoryStore = new window.G3Inventory.InventoryStore(decodedBytes);
      }
    }

    detectAndParse() {
      const b = this.decodedBytes;
      const len = b.length;

      // 1. Try Format A: 932 bytes
      for (let off = 0; off <= len - STRIDE_932; off++) {
        const id1 = readUint16(b, off);
        const id2 = readUint16(b, off + 2);
        if (id1 > 0 && id1 === id2 && KNOWN_HERO_IDS.has(id1)) {
          const lv = readUint16(b, off + OFFSETS_932.LEVEL);
          if (lv >= 1 && lv <= 99) {
            let matches = 1;
            for (let step = 1; step <= 3; step++) {
              const nextOff = off + step * STRIDE_932;
              if (nextOff + 4 <= len) {
                const nid1 = readUint16(b, nextOff);
                const nid2 = readUint16(b, nextOff + 2);
                if (nid1 > 0 && nid1 === nid2) matches++;
              }
            }
            if (matches >= 2) {
              this.formatType = '932';
              this.tableStartOffset = off;
              this.stride = STRIDE_932;
              return;
            }
          }
        }
      }

      // 2. Try Format B: 327 bytes
      const defaultOffset327 = 0x156DD;
      if (defaultOffset327 + STRIDE_327 <= len) {
        const id1 = readUint16(b, defaultOffset327 + OFFSETS_327.ID);
        const id2 = readUint16(b, defaultOffset327 + OFFSETS_327.ID_MIRROR);
        if (id1 > 0 && id1 === id2) {
          this.formatType = '327';
          this.tableStartOffset = defaultOffset327;
          this.stride = STRIDE_327;
          return;
        }
      }

      for (let off = 0; off <= len - (STRIDE_327 * 2); off++) {
        const id1 = readUint16(b, off + OFFSETS_327.ID);
        const id2 = readUint16(b, off + OFFSETS_327.ID_MIRROR);
        if (id1 > 0 && id1 === id2 && KNOWN_HERO_IDS.has(id1)) {
          const nid1 = readUint16(b, off + STRIDE_327 + OFFSETS_327.ID);
          const nid2 = readUint16(b, off + STRIDE_327 + OFFSETS_327.ID_MIRROR);
          if (nid1 > 0 && nid1 === nid2) {
            this.formatType = '327';
            this.tableStartOffset = off;
            this.stride = STRIDE_327;
            return;
          }
        }
      }
    }

    parseCharacters() {
      this.characters = [];
      this.detectAndParse();
      if (!this.stride || this.tableStartOffset === 0) return;

      const b = this.decodedBytes;
      const len = b.length;
      let curOff = this.tableStartOffset;
      let idx = 0;
      const isFormat932 = this.formatType === '932';
      const mirrorOffset = isFormat932 ? 2 : OFFSETS_327.ID_MIRROR;

      while (curOff + this.stride <= len) {
        const charId = readUint16(b, curOff);
        const mirrorId = readUint16(b, curOff + mirrorOffset);
        if (charId > 0 && charId === mirrorId) {
          this.characters.push(new CharacterRecord(b, curOff, idx, this.formatType));
        } else {
          if (isFormat932 && curOff + this.stride * 2 <= len) {
            const nextId = readUint16(b, curOff + this.stride);
            const nextMirror = readUint16(b, curOff + this.stride + 2);
            if (nextId > 0 && nextId === nextMirror) {
              curOff += this.stride;
              continue;
            }
          }
          break;
        }
        curOff += this.stride;
        idx++;
      }
    }

    commitAll() {
      for (const char of this.characters) {
        char.save();
      }
      this.syncAllInstances();
      if (this.inventoryStore && this.inventoryStore.available) {
        this.inventoryStore.ensureEquippedItems(this.characters);
      }
    }

    syncAllInstances() {
      const b = this.decodedBytes;
      const len = b.length;
      if (this.formatType !== '932') return;

      const heroMap = new Map();
      for (const char of this.characters) {
        heroMap.set(char.id, char);
      }

      // Scan through the entire save file for any duplicate 932-byte records of these heroes
      for (let off = 0; off <= len - STRIDE_932; off++) {
        const id1 = readUint16(b, off);
        const id2 = readUint16(b, off + 2);
        if (id1 > 0 && id1 === id2 && heroMap.has(id1)) {
          const char = heroMap.get(id1);
          if (off !== char.startOffset) {
            const lv = readUint16(b, off + OFFSETS_932.LEVEL);
            if (lv >= 1 && lv <= 99) {
              // Synchronize equipment
              writeUint16(b, off + OFFSETS_932.EQUIP_WP, char.equipWp);
              writeUint16(b, off + OFFSETS_932.EQUIP_AR, char.equipAr);
              writeUint16(b, off + OFFSETS_932.EQUIP_NECK, char.equipNeck);
              writeUint16(b, off + OFFSETS_932.EQUIP_RING, char.equipRing);
              writeUint16(b, off + OFFSETS_932.EQUIP_BELT, char.equipBelt);
              writeUint16(b, off + OFFSETS_932.EQUIP_SHOE, char.equipShoe);

              // Synchronize stats
              writeUint16(b, off + OFFSETS_932.LEVEL, char.level);
              writeUint32(b, off + OFFSETS_932.EXP, char.exp);
              writeUint16(b, off + OFFSETS_932.LP, char.lp);
              writeUint16(b, off + OFFSETS_932.TP, char.tpCur);
              writeUint16(b, off + OFFSETS_932.ATK, char.atk);
              writeUint16(b, off + OFFSETS_932.DEP, char.dep);
              writeUint16(b, off + OFFSETS_932.DEX, char.dex);
              writeUint16(b, off + OFFSETS_932.PSY, char.psy);
              writeUint16(b, off + OFFSETS_932.CTP, char.ctp);
              writeUint16(b, off + OFFSETS_932.JOB, char.job);
              writeUint16(b, off + OFFSETS_932.STYLE, char.style);
              writeUint16(b, off + OFFSETS_932.CORPS, char.corps);
              writeUint16(b, off + OFFSETS_932.AT_TYPE, char.atType);
            }
          }
        }
      }
    }
  }

  // 5. Backup & Download Service
  let originalBackup = null;
  let originalFileName = 'G3P_II01.sav';

  function setOriginalBackup(fileName, rawBytes) {
    originalFileName = fileName || 'G3P_II01.sav';
    originalBackup = new Uint8Array(rawBytes);
  }

  async function downloadFile(dataBytes, filename) {
    if (typeof window !== 'undefined' && window.showSaveFilePicker) {
      try {
        const isBak = filename.toLowerCase().endsWith('.bak');
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: isBak ? '창세기전 3 파트 2 세이브 백업 (*.bak)' : '창세기전 3 파트 2 세이브 파일 (*.sav)',
            accept: { 'application/octet-stream': [isBak ? '.bak' : '.sav'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(dataBytes);
        await writable.close();
        return true;
      } catch (err) {
        if (err.name === 'AbortError') return false;
        console.warn('showSaveFilePicker failed, trying Data URI', err);
      }
    }

    try {
      let binary = '';
      const len = dataBytes.byteLength;
      const chunkSize = 0x8000;
      for (let i = 0; i < len; i += chunkSize) {
        const chunk = dataBytes.subarray(i, Math.min(i + chunkSize, len));
        binary += String.fromCharCode.apply(null, chunk);
      }
      const base64 = btoa(binary);
      const dataUri = `data:application/octet-stream;base64,${base64}`;

      const a = document.createElement('a');
      a.href = dataUri;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 2000);
      return true;
    } catch (dataUriErr) {
      console.warn('Data URI failed, using delayed Blob', dataUriErr);
    }

    const blob = new Blob([dataBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 60000);
    return true;
  }

  async function downloadModifiedSave(encodedSaveBytes, customName = null) {
    const filename = customName || originalFileName;
    if (window.location.protocol.startsWith('http')) {
      try {
        const res = await fetch(`/api/save?file=${encodeURIComponent(filename)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: encodedSaveBytes
        });
        if (res.ok) {
          const json = await res.json();
          showToast(`게임 폴더에 즉시 저장 완료! (${json.message || filename})`, 'success');
          return true;
        }
      } catch (e) {
        console.warn('API save failed, falling back to browser download:', e);
      }
    }
    return await downloadFile(encodedSaveBytes, filename);
  }

  async function downloadOriginalBackup() {
    if (!originalBackup) throw new Error('백업 데이터가 없습니다.');
    const bakName = originalFileName.replace(/\.sav$/i, '') + '.bak';
    return await downloadFile(originalBackup, bakName);
  }

  // 6. Cheat Presets
  function applyMaxStats(char) {
    char.hpCur = 9999;
    char.hpMax = 9999;
    char.lp = 4999;
    char.tpCur = 200;
    char.tpMax = 200;
    char.ctp = 250;
    char.psy = 250;
    char.dep = 250;
    char.dex = 250;
    char.atk = 250;
  }

  function applyMaxLevel(char) {
    char.level = 99;
    char.exp = 9999999;
  }

  function applyUltimateGear(char) {
    char.equipAr = 177; // 바운서
    char.equipShoe = 87; // 램버트 슈즈
    char.equipRing = 99; // 램버트 반지
    char.equipNeck = 104; // 천신경
    char.equipBelt = 93; // 램버트 벨트
  }

  function applyAllCharactersMax(saveFile) {
    if (!saveFile || !saveFile.characters) return 0;
    let count = 0;
    for (const char of saveFile.characters) {
      applyMaxStats(char);
      applyMaxLevel(char);
      count++;
    }
    return count;
  }

  // 7. Toast Notification
  function showToast(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="font-weight:800;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 200);
    }, duration);
  }

  // 8. Editor State & UI
  let currentSaveFile = null;
  let currentFileName = 'G3P_II01.sav';
  let currentChar = null;
  let filterText = '';

  function renderCharList() {
    const container = document.getElementById('charListContainer');
    if (!container) return;
    container.innerHTML = '';
    if (!currentSaveFile || currentSaveFile.characters.length === 0) {
      container.innerHTML = '<div style="padding:1.5rem; text-align:center; color:var(--text-muted); font-size:0.85rem;">캐릭터 데이터가 없습니다.</div>';
      return;
    }
    const filtered = currentSaveFile.characters.filter(c => {
      if (!filterText) return true;
      const name = getLookupName('chrname', c.id).toLowerCase();
      return name.includes(filterText) || String(c.id).includes(filterText);
    });

    filtered.forEach(c => {
      const name = getLookupName('chrname', c.id);
      const isSel = currentChar && currentChar.index === c.index;
      const el = document.createElement('div');
      el.className = `char-item ${isSel ? 'active' : ''}`;
      el.innerHTML = `
        <div class="char-item-left">
          <div class="char-item-name">${name}</div>
          <div class="char-item-sub">HP ${c.hpCur} · TP ${c.tpCur}</div>
        </div>
        <div class="char-item-badge">Lv.${c.level}</div>
      `;
      el.addEventListener('click', () => {
        currentChar = c;
        renderCharList();
        renderCharDetail();
      });
      container.appendChild(el);
    });
  }

  function buildSelectOptions(category, selectedId) {
    const list = getCategoryOptions(category);
    let optionsHtml = '';
    let matched = false;
    for (const item of list) {
      const isSel = item.id === selectedId;
      if (isSel) matched = true;
      optionsHtml += `<option value="${item.id}" ${isSel ? 'selected' : ''}>[${item.id}] ${item.name}</option>`;
    }
    if (!matched && selectedId !== undefined) {
      optionsHtml = `<option value="${selectedId}" selected>[${selectedId}] 알 수 없음</option>` + optionsHtml;
    }
    return optionsHtml;
  }

  const WEAPON_GROUPS = [
    {
      label: '⚔️ 세이버 / 크리슬로우 (살라딘, 디에네)',
      items: [174, 178, 129, 130, 131, 132]
    },
    {
      label: '🗡️ 소드 / 직검 (란, 죠안, 데미안, 아델룬 등)',
      items: [56, 57, 58, 59, 60, 61, 62, 154]
    },
    {
      label: '🪓 브로드소드 / 대검 (샤크바리, 유진)',
      items: [64, 65, 66, 67, 156]
    },
    {
      label: '🔫 피스톨 / 권총 (크리스티앙, 중앙군)',
      items: [25, 26, 27, 28, 29, 30, 148]
    },
    {
      label: '💣 S&M 357 / 중화기 (리차드)',
      items: [32, 33, 34, 35, 36, 37, 150]
    },
    {
      label: '🔮 부스터 & 프리즘 / ESP (베라모드, 엠블라)',
      items: [45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 134, 135, 136, 137, 138]
    },
    {
      label: '🥊 크로 / 손톱 (마리아, 격투가)',
      items: [20, 21, 22, 23, 146]
    },
    {
      label: '🪀 휠 & 요요 (루시엔, 페이온)',
      items: [10, 11, 12, 13, 142]
    },
    {
      label: '🎯 렌즈 / 광학병기 (카를로스)',
      items: [15, 16, 17, 18, 144]
    },
    {
      label: '🎀 리본 / 밍밍 (네리사)',
      items: [1, 2, 3, 4, 5, 6, 7, 140]
    },
    {
      label: '🛸 포트 / 비트 (아슈레이, 하이델룬)',
      items: [39, 40, 41, 42, 43, 152]
    },
    {
      label: '🛡️ 일반병 공용 무기',
      items: [158, 159, 197]
    }
  ];

  function buildWeaponOptionsHtml(selectedId) {
    let matched = selectedId === 0;
    let html = `<option value="0" ${selectedId === 0 ? 'selected' : ''}>[0] 없음</option>\n`;

    for (const group of WEAPON_GROUPS) {
      let groupHtml = '';
      for (const itemId of group.items) {
        const isSel = itemId === selectedId;
        if (isSel) matched = true;
        const name = getLookupName('itemwp', itemId, `무기 ${itemId}`);
        groupHtml += `  <option value="${itemId}" ${isSel ? 'selected' : ''}>[${itemId}] ${name}</option>\n`;
      }
      html += `<optgroup label="${group.label}">\n${groupHtml}</optgroup>\n`;
    }

    if (!matched && selectedId !== undefined && selectedId !== null) {
      const unknownName = getLookupName('itemwp', selectedId, `알 수 없음 (${selectedId})`);
      html = `<option value="${selectedId}" selected>[${selectedId}] ${unknownName}</option>\n` + html;
    }

    return html;
  }

  function renderCharDetail() {
    const container = document.getElementById('charDetailContainer');
    if (!container) return;
    if (!currentChar) {
      container.innerHTML = '<div style="margin:auto; text-align:center; color:var(--text-muted);">좌측 목록에서 캐릭터를 선택해주세요.</div>';
      return;
    }
    const c = currentChar;
    const charName = getLookupName('chrname', c.id);
    const jobName = getLookupName('chrjob', c.job);

    container.innerHTML = `
      <div class="char-hero-banner">
        <div class="char-hero-info">
          <div class="char-hero-name">${charName}</div>
          <div class="char-hero-meta">
            <span>슬롯 <strong>#${c.index + 1}</strong></span>
            <span>ID <strong>${c.id}</strong></span>
            <span>직업 <strong>${jobName}</strong></span>
          </div>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button id="btnCharMaxStats" class="btn btn-secondary">⚡ 스탯 MAX</button>
          <button id="btnCharMaxLevel" class="btn btn-secondary">⭐ 레벨 99</button>
          <button id="btnCharUltGear" class="btn btn-secondary">⚔ 최강 장비</button>
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">📊 기본 능력치</div>
        <div class="grid-3">
          <div class="form-group">
            <label class="form-label">레벨 (LV)</label>
            <input id="inputLevel" type="number" min="1" max="99" class="form-input" value="${c.level}" />
          </div>
          <div class="form-group">
            <label class="form-label">경험치 (EXP)</label>
            <input id="inputExp" type="number" min="0" class="form-input" value="${c.exp}" />
          </div>
          <div class="form-group">
            <label class="form-label">공격력 (ATK)</label>
            <input id="inputAtk" type="number" min="0" max="65535" class="form-input" value="${c.atk || 0}" />
          </div>

          <div class="form-group">
            <label class="form-label">표시 HP (LP × 2)</label>
            <input id="inputHpCur" type="number" min="0" max="99999" class="form-input" value="${c.hpCur}" />
          </div>
          <div class="form-group">
            <label class="form-label">생명력 (LP 원본)</label>
            <input id="inputLp" type="number" min="1" max="65535" class="form-input" value="${c.lp || Math.round(c.hpCur / 2)}" />
          </div>
          <div class="form-group">
            <label class="form-label">행동력 (TP)</label>
            <input id="inputTpCur" type="number" min="0" max="999" class="form-input" value="${c.tpCur}" />
          </div>

          <div class="form-group">
            <label class="form-label">집중력 (CTP)</label>
            <input id="inputCtp" type="number" min="0" max="65535" class="form-input" value="${c.ctp || 0}" />
          </div>
          <div class="form-group">
            <label class="form-label">방어력 (DEP)</label>
            <input id="inputDep" type="number" min="0" max="65535" class="form-input" value="${c.dep || 0}" />
          </div>
          <div class="form-group">
            <label class="form-label">민첩성 (DEX)</label>
            <input id="inputDex" type="number" min="0" max="65535" class="form-input" value="${c.dex || 0}" />
          </div>

          <div class="form-group">
            <label class="form-label">정신력 (PSY)</label>
            <input id="inputPsy" type="number" min="0" max="65535" class="form-input" value="${c.psy || 0}" />
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">🛡 장비 아이템</div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">무기 (Weapon)</label>
            <select id="selectWp" class="form-select">${buildWeaponOptionsHtml(c.equipWp)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">갑옷 (Armor)</label>
            <select id="selectAr" class="form-select">${buildSelectOptions('itemar', c.equipAr)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">목걸이 (Necklace)</label>
            <select id="selectNeck" class="form-select">${buildSelectOptions('itemneck', c.equipNeck)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">반지 (Ring)</label>
            <select id="selectRing" class="form-select">${buildSelectOptions('itemring', c.equipRing)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">벨트 (Belt)</label>
            <select id="selectBelt" class="form-select">${buildSelectOptions('itembelt', c.equipBelt)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">신발 (Shoes)</label>
            <select id="selectShoe" class="form-select">${buildSelectOptions('itemshoe', c.equipShoe)}</select>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">⚔ 클래스 및 스타일</div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">직업 (Job)</label>
            <select id="selectJob" class="form-select">${buildSelectOptions('chrjob', c.job)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">체질 / 스타일</label>
            <select id="selectStyle" class="form-select">${buildSelectOptions('styles', c.style)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">군단 (Corps)</label>
            <select id="selectCorps" class="form-select">${buildSelectOptions('CHRcorps', c.corps)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">공격 타입 (Attack Type)</label>
            <select id="selectAtType" class="form-select">${buildSelectOptions('attype', c.atType)}</select>
          </div>
        </div>
      </div>
    `;

    // Bind detail events
    const notify = (msg = null) => {
      renderCharList();
      if (msg) showToast(msg, 'success');
    };

    container.querySelector('#btnCharMaxStats').addEventListener('click', () => {
      applyMaxStats(c);
      renderCharDetail();
      notify('스탯 MAX 적용 완료!');
    });

    container.querySelector('#btnCharMaxLevel').addEventListener('click', () => {
      applyMaxLevel(c);
      renderCharDetail();
      notify('레벨 99 적용 완료!');
    });

    container.querySelector('#btnCharUltGear').addEventListener('click', () => {
      applyUltimateGear(c);
      renderCharDetail();
      notify('최강 장비 장착 완료!');
    });

    const bindVal = (id, prop, extraHandler = null) => {
      const el = container.querySelector('#' + id);
      if (el) {
        el.addEventListener('change', () => {
          c[prop] = parseInt(el.value, 10) || 0;
          if (extraHandler) extraHandler();
          notify();
        });
      }
    };

    bindVal('inputLevel', 'level');
    bindVal('inputExp', 'exp');
    bindVal('inputAtk', 'atk');

    bindVal('inputHpCur', 'hpCur', () => {
      c.lp = Math.round(c.hpCur / 2);
      c.hpMax = c.hpCur;
      const lpEl = container.querySelector('#inputLp');
      if (lpEl) lpEl.value = c.lp;
    });

    bindVal('inputLp', 'lp', () => {
      c.hpCur = c.lp * 2;
      c.hpMax = c.hpCur;
      const hpEl = container.querySelector('#inputHpCur');
      if (hpEl) hpEl.value = c.hpCur;
    });

    bindVal('inputTpCur', 'tpCur');
    bindVal('inputCtp', 'ctp');
    bindVal('inputDep', 'dep');
    bindVal('inputDex', 'dex');
    bindVal('inputPsy', 'psy');

    bindVal('selectWp', 'equipWp');
    bindVal('selectAr', 'equipAr');
    bindVal('selectShoe', 'equipShoe');
    bindVal('selectRing', 'equipRing');
    bindVal('selectNeck', 'equipNeck');
    bindVal('selectBelt', 'equipBelt');
    bindVal('selectJob', 'job');
    bindVal('selectStyle', 'style');
    bindVal('selectCorps', 'corps');
    bindVal('selectAtType', 'atType');
  }

  // 9. Load Buffer & UI Mode
  function loadBuffer(fileName, buffer) {
    try {
      currentFileName = fileName;
      const rawBytes = new Uint8Array(buffer);
      setOriginalBackup(currentFileName, rawBytes);

      const decodedBytes = decodeSaveBuffer(buffer);
      currentSaveFile = new SaveFile(decodedBytes);

      if (currentSaveFile.characters.length === 0) {
        showToast('유효한 캐릭터 데이터를 찾지 못했습니다.', 'error');
        return;
      }

      document.getElementById('currentFileName').textContent = currentFileName;
      document.getElementById('dropzone').style.display = 'none';
      document.getElementById('mainLayout').style.display = 'flex';

      document.getElementById('btnDownloadBackup').disabled = false;
      document.getElementById('btnSaveFile').disabled = false;
      document.getElementById('btnAllMaxStats').disabled = false;
      
      const btnInventory = document.getElementById('btnInventory');
      if (btnInventory) btnInventory.disabled = false;

      const btnOpenAnother = document.getElementById('btnOpenAnother');
      if (btnOpenAnother) btnOpenAnother.style.display = 'inline-flex';

      currentChar = currentSaveFile.characters[0];
      renderCharList();
      renderCharDetail();

      document.dispatchEvent(new CustomEvent('g3:saveloaded', { detail: { saveFile: currentSaveFile, fileName: currentFileName } }));

      showToast(`${currentFileName} 로드 성공! (캐릭터 ${currentSaveFile.characters.length}명)`, 'success');
    } catch (err) {
      console.error(err);
      showToast(`세이브 처리 오류: ${err.message}`, 'error');
    }
  }

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      loadBuffer(file.name, e.target.result);
    };
    reader.readAsArrayBuffer(file);
  }

  // 10. Global Events Setup
  function setup() {
    window.addEventListener('dragover', (e) => e.preventDefault(), false);
    window.addEventListener('drop', (e) => e.preventDefault(), false);

    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) handleFile(file);
        fileInput.value = '';
      });
    }

    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files[0] : null;
        if (file) handleFile(file);
      });
    }

    const searchChar = document.getElementById('searchChar');
    if (searchChar) {
      searchChar.addEventListener('input', (e) => {
        filterText = e.target.value.trim().toLowerCase();
        renderCharList();
      });
    }

    const btnAllMaxStats = document.getElementById('btnAllMaxStats');
    if (btnAllMaxStats) {
      btnAllMaxStats.addEventListener('click', () => {
        if (!currentSaveFile) return;
        const count = applyAllCharactersMax(currentSaveFile);
        renderCharList();
        renderCharDetail();
        showToast(`전체 캐릭터 (${count}명) 스탯 & 레벨 MAX 완료!`, 'success');
      });
    }

    const btnDownloadBackup = document.getElementById('btnDownloadBackup');
    if (btnDownloadBackup) {
      btnDownloadBackup.addEventListener('click', async () => {
        try {
          const ok = await downloadOriginalBackup();
          if (ok !== false) {
            showToast('원본 백업(.bak) 다운로드 완료!', 'success');
          }
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }

    const btnSaveFile = document.getElementById('btnSaveFile');
    if (btnSaveFile) {
      btnSaveFile.addEventListener('click', async () => {
        if (!currentSaveFile) return;
        try {
          currentSaveFile.commitAll();
          const encoded = encodeSaveBuffer(currentSaveFile.decodedBytes);
          const ok = await downloadModifiedSave(encoded, currentFileName);
          if (ok !== false) {
            showToast(`수정된 세이브(${currentFileName}) 저장 완료!`, 'success');
          }
        } catch (err) {
          showToast(`저장 오류: ${err.message}`, 'error');
        }
      });
    }

    const btnOpenAnother = document.getElementById('btnOpenAnother');
    if (btnOpenAnother) {
      btnOpenAnother.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });
    }

    // Sample buttons
    const btnLoadSample01 = document.getElementById('btnLoadSample01');
    if (btnLoadSample01) {
      btnLoadSample01.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const res = await fetch('sample_saves/G3P_II01.sav');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf = await res.arrayBuffer();
          loadBuffer('G3P_II01.sav', buf);
        } catch (err) {
          showToast(`샘플 로드 실패: ${err.message}`, 'error');
        }
      });
    }

    const btnLoadSample00 = document.getElementById('btnLoadSample00');
    if (btnLoadSample00) {
      btnLoadSample00.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const res = await fetch('sample_saves/G3P_II00.sav');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf = await res.arrayBuffer();
          loadBuffer('G3P_II00.sav', buf);
        } catch (err) {
          showToast(`샘플 로드 실패: ${err.message}`, 'error');
        }
      });
    }

    const btnLoadSample = document.getElementById('btnLoadSample');
    if (btnLoadSample) {
      btnLoadSample.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const res = await fetch('sample_saves/G3P_II20.sav');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf = await res.arrayBuffer();
          loadBuffer('G3P_II20.sav', buf);
        } catch (err) {
          showToast(`샘플 로드 실패: ${err.message}`, 'error');
        }
      });
    }
    // Auto-load from URL parameters (?file=G3P_II01.sav or ?slot=01)
    const urlParams = new URLSearchParams(window.location.search);
    const autoFile = urlParams.get('file') || urlParams.get('slot');
    if (autoFile) {
      let targetFile = autoFile;
      if (!targetFile.toLowerCase().endsWith('.sav')) {
        targetFile = `G3P_II${targetFile.padStart(2, '0')}.sav`;
      }
      showToast(`${targetFile} 로드 중...`, 'info');
      fetch(`/api/save?file=${encodeURIComponent(targetFile)}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then(buf => {
          loadBuffer(targetFile, buf);
        })
        .catch(err => {
          console.warn('Auto-load failed:', err);
          showToast(`세이브 자동 로드 실패: ${err.message}`, 'error');
        });
    }

    window.G3Editor = {
      getCategoryOptions,
      getLookupName,
      buildWeaponOptionsHtml,
      WEAPON_GROUPS,
      showToast,
      getCurrentSaveFile: () => currentSaveFile,
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }

})();
