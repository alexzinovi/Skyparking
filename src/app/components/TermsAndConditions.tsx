import { useLanguage } from "./LanguageContext";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

export function TermsAndConditions() {
  const { t, language } = useLanguage();

  const handleBack = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-[#073590] hover:text-[#073590]/80"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            {language === "bg" ? "Назад към началната страница" : "Back to Home"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {language === "bg" ? "Общи условия" : "Terms and Conditions"}
          </h1>

          {language === "bg" ? (
            <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
              {/* Bulgarian Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. ПРЕДМЕТ</h2>
                <p className="text-justify mb-4">
                  Настоящите „Общи условия" регулират взаимоотношенията между фирма "А-Парк 98" ЕООД и потребителите на електронната (интернет) страница и услуги, предоставяни чрез домейна www.skyparking.bg. Фирмата "А-Парк 98" ЕООД е собственик на уебсайта и осигурява услугите, свързани с паркирането на паркинг до летище София. Всеки потребител, който използва нашия уебсайт www.skyparking.bg, е задължен да спазва настоящите общи условия през целия период на ползването – от момента на достъпване на сайта до напускането му.
                </p>
                <p className="text-justify mb-4">
                  Тези условия са задължителни както за фирмата "А-Парк 98" ЕООД така и за всички потребители, които маркират обектите, линковете или бутоните на страниците на www.skyparking.bg/ (с изключение на линка към настоящите „Общи условия") или използват услугите, предлагани от паркинга, намиращ се на адрес гр. София.
                </p>
                <p className="text-justify mb-4">
                  Тук се съдържат Общите условия, съгласно които "А-Парк 98" ЕООД предоставя продукти и услуги на потребителите си, посредством уебсайта https://www.skyparking.bg/. Тези условия обвързват всички потребители и уреждат правилата за използването на уебсайта https://www.skyparking.bg/, включително сключването на договори за паркинг услуги.
                </p>
                <p className="text-justify mb-4">
                  С достъпването на домейна https://www.skyparking.bg/ и използването на неговите услуги, потребителят се съгласява, изцяло приема и се задължава да спазва настоящите Общи условия.
                </p>
                <p className="text-justify">
                  Фирмата "А-Парк 98" ЕООД препоръчва внимателно да прочетете Общите условия, преди да използвате нашия уебсайт. Ако не приемате тези Общи условия, не трябва да използвате https://www.skyparking.bg/.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. ДЕФИНИЦИИ</h2>
                <ul className="list-disc pl-6 space-y-3 text-justify">
                  <li><strong>ПРОДАВАЧ</strong> – "А-Парк 98" ЕООД включително https://www.skyparking.bg/ или всеки партньор на "А-Парк 98" ЕООД свързан с уебсайта https://www.skyparking.bg/</li>
                  <li><strong>САЙТ</strong> – домейна https://www.skyparking.bg/ и неговите поддомейни</li>
                  <li><strong>ПОТРЕБИТЕЛ</strong> – всяко физическо или юридическо лице, което използва уебсайта https://www.skyparking.bg/ по какъвто и да е начин, включително, но не само, като разглежда информацията, прави резервации, заплаща услуги стоки и др.</li>
                  <li><strong>ДОГОВОР</strong> – представлява сключеният от разстояние договор между Продавача и Потребителя за покупко-продажба на Стоки и/или Услуги от уебсайта, като настоящите общи условия за ползване на уебсайта са неразделна част от него.</li>
                  <li><strong>СТОКИ И УСЛУГИ</strong> – всеки предмет на договора за покупко-продажба, предлаган от уебсайта https://www.skyparking.bg/</li>
                  <li><strong>СПЕЦИФИКАЦИИ</strong> – всички характеристики и/или описания на Стоките и Услугите, както са посочени на уебсайта.</li>
                  <li><strong>РЕЗЕРВАЦИЯ</strong> – представлява индивидуална заявка за закупуване на избраните „Услуги", съгласно условията, определени на уебсайта. Това е акт, извършен от потребителя по своя собствена преценка и го обвързва със силата на договор между потребителя и фирмата „А-Парк 98" ЕООД.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. ДАННИ ЗА ПРОДАВАЧА</h2>
                <p className="text-justify mb-4">
                  "А-Парк 98" ЕООД е дружество, регистрирано в Република България, със седалище и адрес на управление: БЪЛГАРИЯ, гр. София (1330), р-н Красна поляна, жк. Разсадника, блок 28, вход А, етаж 1, апартамент 1, вписано в Търговския регистър с ЕИК 208627398.
                </p>
                <p className="text-justify">
                  Данни за кореспонденция: БЪЛГАРИЯ, гр. София (1330), р-н Красна поляна, жк. Разсадника, блок 28, вход А, етаж 1, апартамент 1 и електронна поща: info@skyparking.bg
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. ОБЩИ ПОЛОЖЕНИЯ ЗА ИЗПОЛЗВАНЕ НА САЙТА</h2>
                <p className="text-justify mb-4">
                  4.1. "А-Парк 98" ЕООД (наричан по-долу „Продавач") като оператор на този уебсайт https://www.skyparking.bg/, Ви предоставя правото да преглеждате и изтегляте всички материали, които са публикувани на този сайт само за лична употреба и без търговска цел, при условие че спазвате всички авторски права и съответните означения.
                </p>
                
                <p className="text-justify mb-4">
                  4.2. Всяко използване на този сайт означава, че Вие сте се запознали внимателно с общите условия за използването му и сте се съгласили да ги спазвате безусловно.
                </p>
                
                <p className="text-justify mb-4">
                  4.3. Общите условия могат да бъдат едностранно променяни от "А-Парк 98" ЕООД по всяко време, чрез актуализацията им. Тези промени влизат в сила незабавно след публикуването им на сайта и са задължителни за всички потребители.
                </p>
                
                <p className="text-justify mb-4">
                  4.4. www.skyparking.bg/ има правото по всяко време и без предупреждение да извършва промени в публикуваните материали, услуги и цени. Някои от публикуваните материали могат да бъдат остарели, и "А-Парк 98" ЕООД не носи отговорност за тяхната актуализация.
                </p>
                
                <p className="text-justify">
                  4.7. "А-Парк 98" ЕООД има правото да променя цените по свое усмотрение, по всяко време и без предварително уведомление на потребителите.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. ПРАВИЛА И ЦЕНИ</h2>
                <p className="text-justify mb-4">
                  5.1. Фирмата "А-Парк 98" ЕООД се ангажира при възможност и наличност на места да осигури паркомясто за лек автомобил на всеки свой клиент, който направи резервация посредством сайта www.skyparking.bg/
                </p>
                
                <p className="text-justify mb-4">
                  5.2. Служителите на фирмата "А-Парк 98" ЕООД имат право да откажат приемането на МПС (моторно превозно средство) на паркинга в следните случаи:
                </p>
                
                <p className="text-justify pl-6 mb-4">
                  5.2.1. Когато МПС-то причинява замърсяване, шум или вреди на паркинга или на другите МПС, които се намират в непосредствена близост до него.
                </p>
                
                <p className="text-justify pl-6 mb-4">
                  5.2.2. При преценка от страна на служителите на фирмата "А-Парк 98" ЕООД за потенциално вредоносна ситуация от всякакъв характер.
                </p>
                
                <p className="text-justify mb-4">
                  5.3. При използване на услугите на фирмата "А-Парк 98" ЕООД клиентът потвърждава, че е собственик на МПС (или че е упълномощен от собственика да го използва) и че МПС-то е в добро техническо състояние (с преминал технически преглед), застраховано съгласно всички приложими законови изисквания и разполага с регистрационен талон.
                </p>
                
                <p className="text-justify mb-4">
                  5.4. Ако резервацията е направена от трета страна, тя носи отговорността за договорните задължения на клиента. Третата страна може да има предимство пред клиента само ако фирмата "А-Парк 98" ЕООД приеме това.
                </p>
                
                <p className="text-justify mb-4">
                  5.5. Сумите заплатени за резервации не са възвращаеми за всички клиенти на фирмата „А-Парк 98" ЕООД. Не се таксува допълнителна такса в случай на непоявяване на клиент, след като е направена резервация. Фирмата "А-Парк 98" ЕООД запазва правото да не прави резервации за клиенти според своята преценка.
                </p>
                
                <p className="text-justify pl-6 mb-4">
                  5.5.1. След изтичане на резервирания период, клиентът дължи наем за времето от изтичане на договорения период до получаване на автомобила, в съответствие с посочените в сайта тарифи за паркинг. За автомобили, които не са били иззети в рамките на 30 дни след изтичане на резервирания период, фирмата "А-Парк 98" ЕООД си запазва правото да потърси помощ от МВР и съответните държавни органи.
                </p>
                
                <p className="text-justify pl-6 mb-4">
                  5.5.2. При желание за престой, продължаващ повече от 3 месеца, клиентът трябва да уведоми служителите на фирмата „А-Парк 98" ЕООД.
                </p>
                
                <p className="text-justify mb-4">
                  5.6. Фирмата "А-Парк 98" ЕООД не носи отговорност за вреди, причинени от трети страни или от други клиенти на компанията, но предоставя наличната информация под формата на показания и видеозаписи на пострадалите страни. Фирмата "А-Парк 98" ЕООД не носи отговорност в случай на вреди, ПТП (пътно-транспортно произшествие) или кражба на МПС или на вещи от него.
                </p>
                
                <p className="text-justify mb-4">
                  5.7. Цените на предлаганите услуги от фирмата "А-Парк 98" ЕООД са обявени на уебсайта на компанията в български лева и евро. Плащането се извършва чрез банков превод, плащане с карта или на място с карта или в брой само в български лева или евро.
                </p>
                
                <p className="text-justify mb-4">
                  5.8. Търговецът има право да променя цените на предлаганите услуги в уебсайта по собствено усмотрение без предварително уведомление.
                </p>
                
                <p className="text-justify mb-4">
                  5.9. Потребителят е задължен да заплати цената, която е била актуална по време на поръчката и потвърждението на същата от представител на търговеца.
                </p>
                
                <p className="text-justify mb-4">
                  5.10. Потребителят се задължава:
                </p>
                
                <p className="text-justify pl-6 mb-4">
                  5.10.1. Да предостави точна и коректна информация при резервацията.
                </p>
                
                <p className="text-justify pl-6">
                  5.10.2. Да заплати цената на поръчаните услуги.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. ОТГОВОРНОСТ</h2>
                <p className="text-justify mb-4">
                  6.1. Търговецът не носи отговорност за физически или юридически лица, които използват Съдържанието от сайта.
                </p>
                
                <p className="text-justify mb-4">
                  6.2. Търговецът не носи отговорност за каквито и да било вреди, причинени от използването или невъзможността за използване на информация относно съдържанието на Интернет страницата или за грешки или пропуски в съдържанието, които могат да доведат до вреди.
                </p>
                
                <p className="text-justify mb-4">
                  6.3. Ако потребител смята, че съдържание, изпратено от сайта, нарушава авторско или друго право, той може да се свърже с търговеца чрез наличните данни за контакт, за да може търговецът да вземе информирано решение.
                </p>
                
                <p className="text-justify mb-4">
                  6.4. Търговецът не гарантира достъп до Интернет страницата на потребителите.
                </p>
                
                <p className="text-justify mb-4">
                  6.5. Търговецът не носи отговорност за съдържанието, качеството или вида на други интернет страници, достъпни чрез връзки от съдържанието на техния сайт. Отговорността за тези интернет страници се поема от техните собственици.
                </p>
                
                <p className="text-justify">
                  6.6. Сайтът не носи отговорност в случай на използване на интернет страници и/или съдържание, изпратено до потребителите чрез всякакви средства (електронни, телефон, други), чрез интернет страници, имейл или служители на сайта, когато използването на съдържанието може да причини вреда на потребителя и/или трети лица, обвързани с предаването на съдържанието.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. ФОРСМАЖОР И НЕПРЕОДОЛИМА СИЛА</h2>
                <p className="text-justify mb-4">
                  7.1. С изключение на случаите, когато е посочено друго, "А-Парк 98" ЕООД не носи отговорност за невъзможността да изпълни задълженията си, частично или изцяло, ако такава невъзможност е предизвикана от непреодолима сила.
                </p>
                
                <p className="text-justify mb-4">
                  7.2. Ако "А-Парк 98" ЕООД се позовава на непреодолима сила, трябва незабавно и изчерпателно да уведоми другата страна за настъпилото събитие и да предприеме необходимите мерки за ограничаване на последиците от него.
                </p>
                
                <p className="text-justify mb-4">
                  7.3. Ако "А-Парк 98" ЕООД се позовава на такова събитие, се освобождава от отговорност само ако това събитие прави невъзможно добросъвестното изпълнение на договора.
                </p>
                
                <p className="text-justify">
                  Изпълнението на тези разпоредби относно непреодолимата сила зависи от договорните споразумения и юрисдикцията, в която те се прилагат. Моля, имайте предвид, че това е само общо изложение и не може да замени конкретно правно съветване във връзка с вашия случай.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. РЕЗЕРВАЦИЯ</h2>
                <p className="text-justify mb-4">
                  8.1. Резервацията на паркинг услуги през уебсайта https://www.skyparking.bg/ се осъществява чрез попълване на съответната форма за резервация и последващо потвърждение от страна на "А-Парк 98" ЕООД или нейния представител. Резервацията е предварителна и подлежи на наличността на свободни места за паркиране.
                </p>
                
                <p className="text-justify mb-4">
                  8.2. Потребителят е отговорен за предоставянето на точни и пълни данни при резервацията, включително данни за контакт и информация за превозното средство. "А-Парк 98" ЕООД не носи отговорност за грешки или непълности във въведените от потребителя данни.
                </p>
                
                <p className="text-justify mb-4">
                  8.3. Резервацията се счита за приета и валидна след получаване на потвърждение от страна на "А-Парк 98" ЕООД или нейния представител. В случай на промяна или отмяна на резервацията, потребителят трябва да се свърже с "А-Парк 98" ЕООД в съответните срокове и спазвайки условията, определени от фирмата.
                </p>
                
                <p className="text-justify">
                  8.4. Моля, имайте предвид, че резервацията не гарантира наличност на паркинг място в случаи на непредвидени обстоятелства или препълненост на капацитета. "А-Парк 98" ЕООД си запазва правото да откаже или промени резервацията в случай на форсмажорни обстоятелства или по свое усмотрение.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. СПОРОВЕ</h2>
                <p className="text-justify mb-4">
                  9.1. В случай на спорове, свързани с тези Общи условия, които възникнат между Потребителя и Търговеца, те ще се опитат да ги решат посредством преговори и с взаимно съгласие. Ако не се постигне такова съгласие, спорът ще бъде разрешаван от компетентния съд в Република България.
                </p>
                
                <p className="text-justify mb-4">
                  9.2. Търговецът не носи отговорност за вреди, загуба на печалби, разходи, искове или други отговорности, които възникват при неспазване на тези Общи условия.
                </p>
                
                <p className="text-justify mb-4">
                  9.3. Всякакви спорове, които могат да възникнат между Потребителя и Търговеца, ще бъдат решавани по взаимно съгласие. В случай че това не е възможно, те ще бъдат предадени на компетентния съд в Република България в съответствие с българското законодателство.
                </p>
                
                <p className="text-justify">
                  9.4. Ако някое от условията или разпоредбите, посочени по-горе, бъде намерено за недействително или невалидно по каквато и да било причина, това няма да засегне валидността на останалите разпоредби.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. ЗАКЛЮЧИТЕЛНИ РАЗПОРЕДБИ</h2>
                <p className="text-justify mb-4">
                  10.1. Търговецът запазва правото да въвежда промени в тези Общи условия и във всички аспекти на Интернет страницата, включително промени, които могат да повлияят на съдържанието и услугите, без предварително уведомяване на Потребителите.
                </p>
                
                <p className="text-justify mb-4">
                  10.2. Търговецът не носи отговорност за всякакви грешки, които могат да възникнат на Интернет страницата поради всякаква причина, включително грешки, причинени от промени в настройките, които не са извършени от администратора на страницата.
                </p>
                
                <p className="text-justify">
                  10.3. Интернет страницата си запазва правото да публикува рекламни банери или връзки от всякакъв вид, в съответствие с действащото законодателство.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. ИЗОБРАЖЕНИЯ</h2>
                <p className="text-justify">
                  11.1. Изображенията на страницата са илюстративни и е възможно да има несъответствия с услугите, които се представят.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. ЗАЩИТА НА ЛИЧНИТЕ ДАННИ И ПОВЕРИТЕЛНОСТ</h2>
                <p className="text-justify mb-4">
                  12.1. Паркингът събира и обработва лични данни на Клиентите единствено за целите на предоставяне на услугите по настоящите Общи условия – извършване на резервации, комуникация, издаване на документи за плащане, осигуряване на трансфер и отчетност пред държавните органи, когато това е необходимо по закон.
                </p>
                
                <p className="text-justify mb-4">
                  12.2. Обработваните лични данни могат да включват: име и фамилия, телефон, имейл, регистрационен номер на автомобила, данни за плащане, както и данни, предоставени за издаване на фактура.
                </p>
                
                <p className="text-justify mb-4">
                  12.3. Всички лични данни се съхраняват в защитена система и не се предоставят на трети лица, освен когато това е необходимо по силата на закон или за изпълнение на услугата (например счетоводна обработка, хостинг доставчик или компетентни държавни органи).
                </p>
                
                <p className="text-justify mb-4">
                  12.4. Срокът за съхранение на личните данни е съобразен с нормативните изисквания и е не по-дълъг от необходимото за изпълнение на услугата или за доказване на договорни отношения.
                </p>
                
                <p className="text-justify mb-4">
                  12.5. Клиентът има право по всяко време да поиска достъп до своите лични данни, тяхното коригиране, изтриване („право да бъдеш забравен") или ограничаване на обработването, както и да оттегли дадено съгласие.
                </p>
                
                <p className="text-justify mb-4">
                  12.6. При въпроси или оплаквания, свързани с обработката на лични данни, Клиентът може да се свърже с Паркинга чрез официалните канали за контакт. Клиентът има право да подаде жалба и пред Комисията за защита на личните данни (КЗЛД).
                </p>
                
                <p className="text-justify">
                  12.7. Паркингът полага всички разумни технически и организационни мерки за защита на предоставените лични данни и за предотвратяване на неправомерен достъп, използване или разкриване.
                </p>
              </section>

              <div className="mt-12 pt-8 border-t-2 border-gray-300 text-center">
                <p className="font-semibold text-lg text-gray-900">
                  Настоящите Общи условия са издадени от:
                </p>
                <p className="font-bold text-xl text-[#073590] mt-2">
                  „А-Парк 98" ЕООД
                </p>
                <p className="text-gray-700 mt-1">
                  ЕИК: 208627398
                </p>
              </div>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
              {/* English Terms - Full Translation */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. SUBJECT</h2>
                <p className="text-justify mb-4">
                  These "Terms and Conditions" regulate the relationship between "A-Park 98" Ltd. and users of the electronic (internet) website and services provided through the domain www.skyparking.bg. The company "A-Park 98" Ltd. is the owner of the website and provides services related to parking near Sofia Airport. Every user who uses our website www.skyparking.bg is obliged to comply with these terms and conditions throughout the entire period of use - from the moment of accessing the site until leaving it.
                </p>
                <p className="text-justify mb-4">
                  These conditions are mandatory for both "A-Park 98" Ltd. and all users who click on objects, links or buttons on the pages of www.skyparking.bg/ (except for the link to these "Terms and Conditions") or use the services offered by the parking lot located in Sofia.
                </p>
                <p className="text-justify mb-4">
                  These Terms and Conditions contain the rules according to which "A-Park 98" Ltd. provides products and services to its users through the website https://www.skyparking.bg/. These conditions bind all users and regulate the rules for using the website https://www.skyparking.bg/, including the conclusion of contracts for parking services.
                </p>
                <p className="text-justify mb-4">
                  By accessing the domain https://www.skyparking.bg/ and using its services, the user agrees, fully accepts and undertakes to comply with these Terms and Conditions.
                </p>
                <p className="text-justify">
                  "A-Park 98" Ltd. recommends that you carefully read the Terms and Conditions before using our website. If you do not accept these Terms and Conditions, you should not use https://www.skyparking.bg/.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. DEFINITIONS</h2>
                <ul className="list-disc pl-6 space-y-3 text-justify">
                  <li><strong>SELLER</strong> – "A-Park 98" Ltd. including https://www.skyparking.bg/ or any partner of "A-Park 98" Ltd. related to the website https://www.skyparking.bg/</li>
                  <li><strong>SITE</strong> – the domain https://www.skyparking.bg/ and its subdomains</li>
                  <li><strong>USER</strong> – any natural or legal person who uses the website https://www.skyparking.bg/ in any way, including but not limited to viewing information, making reservations, paying for services and goods, etc.</li>
                  <li><strong>CONTRACT</strong> – represents a distance contract concluded between the Seller and the User for the purchase and sale of Goods and/or Services from the website, with these general terms of use of the website being an integral part of it.</li>
                  <li><strong>GOODS AND SERVICES</strong> – any subject of the purchase and sale contract offered by the website https://www.skyparking.bg/</li>
                  <li><strong>SPECIFICATIONS</strong> – all characteristics and/or descriptions of Goods and Services as indicated on the website.</li>
                  <li><strong>RESERVATION</strong> – represents an individual order for the purchase of selected "Services" according to the conditions specified on the website. This is an act performed by the user at their own discretion and binds them with the force of a contract between the user and "A-Park 98" Ltd.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. SELLER INFORMATION</h2>
                <p className="text-justify mb-4">
                  "A-Park 98" Ltd. is a company registered in the Republic of Bulgaria, with headquarters and management address: BULGARIA, Sofia (1330), Krasna Polyana district, Razsadnika residential complex, Block 28, Entrance A, Floor 1, Apartment 1, registered in the Commercial Register with UIC 208627398.
                </p>
                <p className="text-justify">
                  Correspondence details: BULGARIA, Sofia (1330), Krasna Polyana district, Razsadnika residential complex, Block 28, Entrance A, Floor 1, Apartment 1 and email: info@skyparking.bg
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. GENERAL PROVISIONS FOR USE OF THE SITE</h2>
                <p className="text-justify mb-4">
                  4.1. "A-Park 98" Ltd. (hereinafter referred to as the "Seller") as the operator of this website https://www.skyparking.bg/, grants you the right to view and download all materials published on this site only for personal use and without commercial purpose, provided that you comply with all copyrights and relevant designations.
                </p>
                
                <p className="text-justify mb-4">
                  4.2. Any use of this site means that you have carefully read the terms and conditions for its use and have agreed to comply with them unconditionally.
                </p>
                
                <p className="text-justify mb-4">
                  4.3. The Terms and Conditions may be unilaterally changed by "A-Park 98" Ltd. at any time by updating them. These changes take effect immediately after their publication on the site and are mandatory for all users.
                </p>
                
                <p className="text-justify mb-4">
                  4.4. www.skyparking.bg/ has the right at any time and without warning to make changes to published materials, services and prices. Some of the published materials may be outdated, and "A-Park 98" Ltd. is not responsible for updating them.
                </p>
                
                <p className="text-justify">
                  4.7. "A-Park 98" Ltd. has the right to change prices at its discretion, at any time and without prior notice to users.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. RULES AND PRICES</h2>
                <p className="text-justify mb-4">
                  5.1. "A-Park 98" Ltd. undertakes, when possible and subject to availability, to provide a parking space for a passenger car to each client who makes a reservation through the website www.skyparking.bg/
                </p>
                
                <p className="text-justify mb-4">
                  5.2. The employees of "A-Park 98" Ltd. have the right to refuse the acceptance of a motor vehicle at the parking lot in the following cases:
                </p>
                
                <p className="text-justify pl-6 mb-4">
                  5.2.1. When the motor vehicle causes pollution, noise or damage to the parking lot or to other motor vehicles located in its immediate vicinity.
                </p>
                
                <p className="text-justify pl-6 mb-4">
                  5.2.2. At the discretion of the employees of "A-Park 98" Ltd. for a potentially harmful situation of any nature.
                </p>
                
                <p className="text-justify mb-4">
                  5.3. When using the services of "A-Park 98" Ltd., the client confirms that they are the owner of the motor vehicle (or that they are authorized by the owner to use it) and that the motor vehicle is in good technical condition (having passed technical inspection), insured in accordance with all applicable legal requirements and has a registration certificate.
                </p>
                
                <p className="text-justify mb-4">
                  5.4. If the reservation is made by a third party, it bears the responsibility for the client's contractual obligations. The third party may have priority over the client only if "A-Park 98" Ltd. accepts this.
                </p>
                
                <p className="text-justify mb-4">
                  5.5. Amounts paid for reservations are non-refundable for all clients of "A-Park 98" Ltd. No additional fee is charged in case of non-appearance of a client after a reservation has been made. "A-Park 98" Ltd. reserves the right not to make reservations for clients at its discretion.
                </p>
                
                <p className="text-justify pl-6 mb-4">
                  5.5.1. After the expiration of the reserved period, the client owes rent for the time from the expiration of the agreed period until receiving the vehicle, in accordance with the parking rates specified on the site. For vehicles that have not been collected within 30 days after the expiration of the reserved period, "A-Park 98" Ltd. reserves the right to seek assistance from the Ministry of Interior and relevant state authorities.
                </p>
                
                <p className="text-justify pl-6 mb-4">
                  5.5.2. If the stay is desired to last more than 3 months, the client must notify the employees of "A-Park 98" Ltd.
                </p>
                
                <p className="text-justify mb-4">
                  5.6. "A-Park 98" Ltd. is not responsible for damages caused by third parties or by other clients of the company, but provides available information in the form of testimonies and video recordings to the affected parties. "A-Park 98" Ltd. is not responsible in case of damages, traffic accidents or theft of a motor vehicle or items from it.
                </p>
                
                <p className="text-justify mb-4">
                  5.7. The prices of the services offered by "A-Park 98" Ltd. are announced on the company's website in Bulgarian Leva and Euro. Payment is made by bank transfer, card payment or on-site by card or cash only in Bulgarian Leva or Euro.
                </p>
                
                <p className="text-justify mb-4">
                  5.8. The Seller has the right to change the prices of the services offered on the website at its own discretion without prior notice.
                </p>
                
                <p className="text-justify mb-4">
                  5.9. The User is obliged to pay the price that was current at the time of the order and its confirmation by a representative of the Seller.
                </p>
                
                <p className="text-justify mb-4">
                  5.10. The User undertakes:
                </p>
                
                <p className="text-justify pl-6 mb-4">
                  5.10.1. To provide accurate and correct information during the reservation.
                </p>
                
                <p className="text-justify pl-6">
                  5.10.2. To pay the price of the ordered services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. LIABILITY</h2>
                <p className="text-justify mb-4">
                  6.1. The Seller is not responsible for natural or legal persons who use the Content from the site.
                </p>
                
                <p className="text-justify mb-4">
                  6.2. The Seller is not responsible for any damages caused by the use or inability to use information regarding the content of the website or for errors or omissions in the content that may lead to damages.
                </p>
                
                <p className="text-justify mb-4">
                  6.3. If a user believes that content sent from the site infringes copyright or other rights, they can contact the Seller through the available contact details so that the Seller can make an informed decision.
                </p>
                
                <p className="text-justify mb-4">
                  6.4. The Seller does not guarantee users' access to the website.
                </p>
                
                <p className="text-justify mb-4">
                  6.5. The Seller is not responsible for the content, quality or type of other websites accessible through links from the content of their site. Responsibility for these websites is assumed by their owners.
                </p>
                
                <p className="text-justify">
                  6.6. The site is not responsible in case of use of websites and/or content sent to users through any means (electronic, telephone, other), through websites, email or site employees, when the use of the content may cause harm to the user and/or third parties involved in the transmission of the content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. FORCE MAJEURE</h2>
                <p className="text-justify mb-4">
                  7.1. Except in cases where otherwise stated, "A-Park 98" Ltd. is not responsible for the inability to fulfill its obligations, partially or completely, if such inability is caused by force majeure.
                </p>
                
                <p className="text-justify mb-4">
                  7.2. If "A-Park 98" Ltd. invokes force majeure, it must immediately and comprehensively notify the other party of the event and take necessary measures to limit its consequences.
                </p>
                
                <p className="text-justify mb-4">
                  7.3. If "A-Park 98" Ltd. invokes such an event, it is released from liability only if this event makes the good faith performance of the contract impossible.
                </p>
                
                <p className="text-justify">
                  The implementation of these provisions regarding force majeure depends on contractual agreements and the jurisdiction in which they are applied. Please note that this is only a general statement and cannot replace specific legal advice in connection with your case.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. RESERVATION</h2>
                <p className="text-justify mb-4">
                  8.1. Reservation of parking services through the website https://www.skyparking.bg/ is carried out by filling out the appropriate reservation form and subsequent confirmation by "A-Park 98" Ltd. or its representative. The reservation is preliminary and subject to the availability of free parking spaces.
                </p>
                
                <p className="text-justify mb-4">
                  8.2. The User is responsible for providing accurate and complete data during the reservation, including contact details and vehicle information. "A-Park 98" Ltd. is not responsible for errors or incompleteness in the data entered by the user.
                </p>
                
                <p className="text-justify mb-4">
                  8.3. The reservation is considered accepted and valid after receiving confirmation from "A-Park 98" Ltd. or its representative. In case of a change or cancellation of the reservation, the user must contact "A-Park 98" Ltd. within the appropriate deadlines and in accordance with the conditions specified by the company.
                </p>
                
                <p className="text-justify">
                  8.4. Please note that the reservation does not guarantee the availability of a parking space in cases of unforeseen circumstances or capacity overflow. "A-Park 98" Ltd. reserves the right to refuse or change the reservation in case of force majeure or at its discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. DISPUTES</h2>
                <p className="text-justify mb-4">
                  9.1. In the event of disputes related to these Terms and Conditions that arise between the User and the Seller, they will attempt to resolve them through negotiations and mutual agreement. If such agreement is not reached, the dispute will be resolved by the competent court in the Republic of Bulgaria.
                </p>
                
                <p className="text-justify mb-4">
                  9.2. The Seller is not responsible for damages, loss of profits, costs, claims or other liabilities arising from non-compliance with these Terms and Conditions.
                </p>
                
                <p className="text-justify mb-4">
                  9.3. Any disputes that may arise between the User and the Seller will be resolved by mutual agreement. If this is not possible, they will be submitted to the competent court in the Republic of Bulgaria in accordance with Bulgarian law.
                </p>
                
                <p className="text-justify">
                  9.4. If any of the conditions or provisions mentioned above are found to be invalid or ineffective for any reason, this will not affect the validity of the remaining provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. FINAL PROVISIONS</h2>
                <p className="text-justify mb-4">
                  10.1. The Seller reserves the right to introduce changes to these Terms and Conditions and to all aspects of the website, including changes that may affect the content and services, without prior notice to Users.
                </p>
                
                <p className="text-justify mb-4">
                  10.2. The Seller is not responsible for any errors that may occur on the website for any reason, including errors caused by changes in settings that have not been made by the site administrator.
                </p>
                
                <p className="text-justify">
                  10.3. The website reserves the right to publish advertising banners or links of any kind, in accordance with applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. IMAGES</h2>
                <p className="text-justify">
                  11.1. The images on the site are illustrative and there may be discrepancies with the services presented.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. PERSONAL DATA PROTECTION AND PRIVACY</h2>
                <p className="text-justify mb-4">
                  12.1. The Parking collects and processes personal data of Clients solely for the purposes of providing services under these Terms and Conditions - making reservations, communication, issuing payment documents, providing transfer and reporting to state authorities when required by law.
                </p>
                
                <p className="text-justify mb-4">
                  12.2. The processed personal data may include: name and surname, telephone, email, vehicle registration number, payment data, as well as data provided for invoice issuance.
                </p>
                
                <p className="text-justify mb-4">
                  12.3. All personal data is stored in a secure system and is not provided to third parties, except when this is required by law or for the performance of the service (for example, accounting processing, hosting provider or competent state authorities).
                </p>
                
                <p className="text-justify mb-4">
                  12.4. The retention period for personal data is in accordance with regulatory requirements and is no longer than necessary for the performance of the service or for proving contractual relationships.
                </p>
                
                <p className="text-justify mb-4">
                  12.5. The Client has the right at any time to request access to their personal data, their correction, deletion ("right to be forgotten") or restriction of processing, as well as to withdraw given consent.
                </p>
                
                <p className="text-justify mb-4">
                  12.6. For questions or complaints related to the processing of personal data, the Client can contact the Parking through official contact channels. The Client also has the right to file a complaint with the Commission for Personal Data Protection (CPDP).
                </p>
                
                <p className="text-justify">
                  12.7. The Parking applies all reasonable technical and organizational measures to protect the provided personal data and to prevent unauthorized access, use or disclosure.
                </p>
              </section>

              <div className="mt-12 pt-8 border-t-2 border-gray-300 text-center">
                <p className="font-semibold text-lg text-gray-900">
                  These Terms and Conditions are issued by:
                </p>
                <p className="font-bold text-xl text-[#073590] mt-2">
                  "A-Park 98" Ltd.
                </p>
                <p className="text-gray-700 mt-1">
                  UIC: 208627398
                </p>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {language === "bg" 
                ? "Последна актуализация: Февруари 2026" 
                : "Last updated: February 2026"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
