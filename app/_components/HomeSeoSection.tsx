import Link from "next/link";

// 메인 페이지 하단 정보성 텍스트 섹션 (검색 로봇이 읽는 본문 + 사용자용 안내). 훅을 쓰지 않아 서버 렌더링 HTML에도 그대로 포함됨.

const RATIOS = [
  {
    ratio: "1:1 정방형",
    size: "1000x1000px",
    where: "스마트스토어, 쿠팡, 11번가·G마켓, 올웨이즈",
    pros: "목록에서 모든 상품이 같은 크기로 정렬되어 비교하기 쉽고, 상품을 중앙에 두기만 해도 구도가 안정적입니다.",
    caution: "세로로 긴 상품(원피스, 병, 포스터)은 좌우 여백이 커져 상품이 작아 보일 수 있습니다.",
  },
  {
    ratio: "3:4 세로형",
    size: "1000x1333px (또는 600x800px)",
    where: "에이블리, 지그재그, 무신사, W컨셉",
    pros: "스마트폰을 세로로 들고 볼 때 화면을 가장 넓게 쓰며, 전신 착용컷과 모델컷이 잘 어울립니다.",
    caution: "정방형 사진을 그대로 올리면 위아래 여백이 생기거나 노출 방식에 따라 잘려 보일 수 있습니다.",
  },
  {
    ratio: "4:5 세로형",
    size: "1000x1250px",
    where: "무신사 고해상도, 인스타그램 피드 등 SNS 겸용",
    pros: "3:4보다 살짝 짧아 상반신·디테일 컷과 SNS 피드에 두루 쓰기 좋은 절충 비율입니다.",
    caution: "플랫폼 기본 비율이 3:4라면 상하 여백이 생길 수 있으니 입점 가이드를 확인하세요.",
  },
];

const FAQ = [
  {
    q: "이미지를 줄이면 화질이 깨지지 않나요?",
    a: "큰 이미지를 작게 줄이는 것은 화질 손실이 거의 눈에 띄지 않습니다. PIXS는 브라우저의 Canvas에 원본을 그린 뒤 목표 크기로 다시 샘플링하는 방식으로 리사이징하며, 줄이는 과정에서 픽셀이 평균화되어 오히려 선명하게 보이기도 합니다. 다만 모든 변환이 완전한 무손실은 아닙니다. 저장 형식이 JPG면 고화질(품질 0.92) 압축이 한 번 들어가고, PNG로 저장하면 압축 손실은 없습니다. 반대로 작은 이미지를 키우면 흐려지니, 원본은 목표 크기보다 크게 준비하세요.",
  },
  {
    q: "대표이미지 포맷은 JPG와 WebP 중 무엇이 좋나요?",
    a: "호환성이 가장 안정적인 것은 JPG입니다. 모든 마켓과 기기에서 열리고 검수 이슈도 적습니다. WebP는 같은 화질에서 JPG보다 용량이 작은 경우가 많아 로딩에 유리하지만, 마켓과 카테고리에 따라 업로드가 제한될 수 있습니다. 쿠팡 등에서는 JPG·PNG를 권장하니, 마켓 지원 여부를 모르겠다면 JPG로 등록하고 용량은 압축으로 줄이는 것이 안전합니다.",
  },
  {
    q: "스마트스토어 이미지를 쿠팡에 그대로 쓰면 왜 반려되나요?",
    a: "마켓마다 대표이미지 기준이 다르기 때문입니다. 스마트스토어는 배경이 흰색일 필요가 없지만, 쿠팡은 카탈로그 구조상 RGB 255 순백색 배경과 상품 면적 기준을 요구합니다. 스마트스토어용으로 만든 감성 배경, 블러 여백, 테두리, 홍보 문구가 들어간 이미지는 쿠팡에서 반려될 수 있습니다. 마켓별로 따로 만들어야 하며, PIXS는 쿠팡 선택 시 배경을 순백색으로 고정해 줍니다.",
  },
  {
    q: "업로드한 사진이 서버에 저장되나요?",
    a: "아니요. PIXS는 이미지를 서버로 전송하거나 저장하지 않습니다. 파일 선택과 변환, 압축, ZIP 생성까지 모든 과정이 내 브라우저(클라이언트) 안에서 JavaScript와 Canvas로만 실행되며, 페이지를 닫으면 작업물도 사라집니다. 신제품 사진처럼 외부에 공개하기 전인 이미지도 안심하고 작업할 수 있습니다. 자세한 내용은 개인정보처리방침을 참고하세요.",
  },
];

const GUIDE_CARDS = [
  {
    href: "/guide/smartstore",
    title: "스마트스토어 가이드",
    desc: "대표이미지 1000x1000, 노출 불이익 유형, 추가 이미지 9장 배치, 상세페이지 860px",
  },
  {
    href: "/guide/coupang",
    title: "쿠팡 가이드",
    desc: "순백색 배경(RGB 255), 윙 이미지 반려 사유별 해결법, 상세페이지 780px",
  },
  {
    href: "/guide/fashion",
    title: "패션 플랫폼 가이드",
    desc: "에이블리·지그재그·무신사 3:4·4:5 규격, 상세페이지 1000px, 스토어 배너",
  },
];

const CARD = "rounded-2xl border border-slate-200 bg-white p-4 sm:p-8";

export default function HomeSeoSection() {
  return (
    <section aria-labelledby="home-info-title" className="space-y-4 text-slate-700">
      <div className="text-center">
        <h2 id="home-info-title" className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl break-keep">
          셀러가 꼭 알아야 할 대표이미지 최적화 정보
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 break-keep">
          도구를 쓰기 전에 읽어 두면 좋은, 썸네일이 왜 중요한지와 비율·포맷·마켓별 차이를 정리했습니다.
        </p>
      </div>

      <article className={CARD}>
        <h3 className="text-base font-bold text-slate-900 break-keep">오픈마켓 썸네일 최적화가 중요한 이유</h3>
        <div className="mt-3 space-y-3 text-sm leading-relaxed break-keep">
          <p>
            모바일 쇼핑에서 구매자는 작은 화면에 한꺼번에 나열된 수십 개의 썸네일을 손가락으로 빠르게 넘기며 상품을 고릅니다. 상품명이나 후기를 읽기 전에, <strong>썸네일이 첫인상과 클릭 여부를 거의 결정</strong>합니다. 같은 가격과 같은 상품명이라도 선명하고 상품이 꽉
            찬 이미지는 흐리거나 여백이 큰 이미지보다 클릭률(CTR)이 높기 마련이고, 클릭이 쌓이면 상품의 반응 지표도 좋아져 노출에 유리한 선순환이 생깁니다.
          </p>
          <p>
            해상도도 중요합니다. 요즘 스마트폰은 화면 밀도가 높아 낮은 해상도의 이미지는 쉽게 흐려 보입니다. 대표이미지는 최소 1000px 이상으로 준비하고 용량은 가볍게 압축해야, 선명도와 로딩 속도를 모두 잡을 수 있습니다. 로딩이 느리면 구매자가 이미지가 뜨기도 전에 이탈하기 때문입니다.
          </p>
          <p>
            마켓마다 노출 기준도 다릅니다. <strong>네이버 스마트스토어</strong>는 1:1 정방형을 표준으로 하며 텍스트·테두리 삽입을 지양하도록 하고, <strong>쿠팡</strong>은 순백색 배경과 상품 면적 기준을 요구하는 카탈로그형 구조입니다. <strong>에이블리·무신사</strong> 같은 패션 앱은 모바일 피드가 세로형이라
            3:4나 4:5 비율이 기본입니다. 한 장의 사진을 모든 마켓에 그대로 올리면 잘리거나 반려될 수 있어, 마켓별 규격을 지키는 것이 노출과 등록 승인의 출발점입니다.
          </p>
        </div>
      </article>

      <article className={CARD}>
        <h3 className="text-base font-bold text-slate-900 break-keep">비율별 가이드 요약: 1:1 vs 3:4 vs 4:5</h3>
        <p className="mt-3 text-sm leading-relaxed break-keep">
          정사각형(1:1)과 세로형(3:4, 4:5)은 모바일 화면에서 보이는 방식이 다릅니다. 상품 종류와 입점할 마켓에 맞춰 선택하세요.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {RATIOS.map((r) => (
            <div key={r.ratio} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-relaxed">
              <p className="text-base font-bold text-slate-900">{r.ratio}</p>
              <p className="text-xs font-semibold text-blue-600">{r.size}</p>
              <dl className="mt-3 space-y-2 break-keep">
                <div>
                  <dt className="text-xs font-bold text-slate-500">주로 쓰는 곳</dt>
                  <dd>{r.where}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-500">모바일 적합성</dt>
                  <dd>{r.pros}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-500">주의할 점</dt>
                  <dd>{r.caution}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed break-keep">
          정리하면, 마켓 목록의 통일감이 중요한 오픈마켓은 1:1, 모바일 피드에서 착용컷을 크게 보여 주는 패션 앱은 3:4나 4:5가 적합합니다. 한 상품의 모든 컷은 같은 비율로 맞춰야 목록과 상세에서 레이아웃이 흔들리지 않습니다.
        </p>
      </article>

      <article className={CARD}>
        <h3 className="text-base font-bold text-slate-900 break-keep">자주 묻는 질문 (FAQ)</h3>
        <div className="mt-3 space-y-2">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800 flex items-center gap-2">
                <span className="text-slate-400 transition group-open:rotate-90">▶</span>
                {f.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 break-keep">{f.a}</p>
            </details>
          ))}
        </div>
      </article>

      <article className={CARD}>
        <h3 className="text-base font-bold text-slate-900 break-keep">마켓별 심층 가이드 바로가기</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 break-keep">
          각 마켓의 규격 표와 노출·반려 주의점, 실무 팁을 자세히 정리했습니다.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {GUIDE_CARDS.map((g) => (
            <li key={g.href}>
              <Link
                href={g.href}
                className="block h-full rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-400 hover:shadow-sm"
              >
                <p className="text-sm font-bold text-slate-900 break-keep">{g.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 break-keep">{g.desc}</p>
                <span className="mt-2 inline-block text-xs font-semibold text-blue-600">가이드 보기 →</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-400 break-keep">
          ※ 규격은 PIXS가 정리한 권장 기준이며 마켓 정책에 따라 바뀔 수 있습니다. 등록 전 각 판매자센터의 최신 안내를 확인하세요.
        </p>
      </article>
    </section>
  );
}
