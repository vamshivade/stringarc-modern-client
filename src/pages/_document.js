import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Meta Tags for SEO */}
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
          <meta
            name="description"
            content="Play your favorite arcade games like Flappy Bird, Snake, and Doodle Jump on String Arcade and earn free Solana! Join now to enjoy exciting games and win amazing rewards."
          />
          <meta
            name="keywords"
            content="Play Flappy Bird, Arcade Blockchain Games, Free Solana Arcade Games, Best Blockchain Arcade Games, Flappy Bird Game, Pac-Man Game, Snake Game, Space Invaders Game"
          />
          <title>Play Modern Games</title>

          {/* Favicon */}
          <link rel="icon" href="/images/logo.svg" />

          {/* Fonts and Styles */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;600;700;800;900&family=Ubuntu:wght@300;400;500;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Righteous&display=swap"
            rel="stylesheet"
          />

          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css"
          />
          <link
            rel="stylesheet"
            type="text/css"
            charset="UTF-8"
            href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
          />
          <link
            rel="stylesheet"
            type="text/css"
            href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
          />

          <link
            href="https://fonts.googleapis.com/css2?family=Pangolin&display=swap"
            rel="stylesheet"
          />

          {/* Google Analytics */}

          <script src="https://telegram.org/js/telegram-web-app.js"></script>

          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-Q6EKQ53YY4"
          ></script>

          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-Q6EKQ53YY4');
              `,
            }}
          />

          {/* show_8692316 and show_8692316('pop')*/}
          <script
            src="//staurdoalse.net/vignette.min.js"
            data-zone="8692316"
            data-sdk="show_8692316"
          ></script>

          {/* Ads SDK from scroll bottom */}
          <script
            src="https://richinfo.co/richpartners/telegram/js/rp-ob.js?pub_id=950447&widget_id=354303"
            async
            data-cfasync="false"
          ></script>

          {/* adSDK 6052371 by onclckvd */}
          <script src="https://js.onclckvd.com/in-stream-ad-admanager/tma.js"></script>

          {/* auto popup ads */}
          <script
            src="//staurdoalse.net/sdk.js"
            data-zone="8844872"
            data-sdk="show_8844872"
            data-sdk-auto="1/1/30/30/0"
          ></script>

          {/* Sonar SDK ADS */}
          <script src="https://static.sonartech.io/lib/1.0.0/sonar.js?appId=app_9878ff40"></script>
          {/* <script src="https://static.sonartech.io/lib/1.0.0/sonar.js?appId=app_9878ff40&isDebug=true"></script> */}

          <script
            src="https://telegram.org/js/telegram-web-app.js?56"
            async
          ></script>
          <script
            type="text/javascript"
            src="https://cdn.tgads.space/assets/js/tg-ads-co-widget.min.js"
            async
          ></script>

          <script src="https://sad.adsgram.ai/js/sad.min.js" async></script>

          {/*  */}
          {/*  */}

          {/* recent 2008618 ad */}
          <script
            src="https://js.mbidadm.com/in-stream-ad-admanager/tma.js"
            async
            defer
          />

          {/* Adextra ads */}
          <script
            async
            src="https://partner.adextra.io/jt/285ad57415617f2ac500ef639987399bde88dcb2.js"
          ></script>

          {/* new add  05-11-2025 */}
          <script
            src="//munqu.com/sdk.js"
            data-zone="10087360"
            data-sdk="show_10087360"
          ></script>

        </Head>
        <body className="text-blueGray-700 antialiased">
          <div id="page-transition"></div>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
