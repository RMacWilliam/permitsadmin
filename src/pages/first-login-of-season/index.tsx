import AuthenticatedPageLayout from "@/components/layouts/authenticated-page"
import { AppContext, IAppContextValues } from "@/custom/app-context";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import $ from 'jquery';

declare var YT: any;

export default function FirstLoginOfSeasonPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "first-login-of-season" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthenticatedPageLayout showAlert={showAlert}>
            <FirstLoginOfSeason appContext={appContext} router={router} setShowAlert={setShowAlert}></FirstLoginOfSeason>
        </AuthenticatedPageLayout>
    )
}

function FirstLoginOfSeason({ appContext, router, setShowAlert }:
    {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    let player: any;

    const t: Function = appContext.translation.t;

    useEffect(() => {
        if (typeof YT === "undefined") {
            $.ajax({
                dataType: "script",
                cache: false,
                url: "https://www.youtube.com/iframe_api"
            })
                .done(function (script, textStatus) {
                    initializeYouTubeVideo();
                });
        } else {
            initializeYouTubeVideo();
        }
    }, []);

    return (
        <>
            <Head>
                <title>{t("FirstLoginOfSeason.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4 className="mb-3">{t("FirstLoginOfSeason.Title")}</h4>

            <p>{t("FirstLoginOfSeason.Message")}</p>

            <div className="d-flex justify-content-center h-100">
                <div id="video-placeholder"></div>
            </div>
        </>
    )

    function initializeYouTubeVideo() {
        YT.ready(function () {
            player = new YT.Player('video-placeholder', {
                videoId: 'eu7K1YTi1Pw',
                playerVars: {
                    //controls: 0
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        });
    }

    function onPlayerReady() {
        //
    }

    function onPlayerStateChange(e: any) {
        if (e.data === 0) {
            appContext.updater(draft => {
                draft.isFirstLoginOfSeason = false;
            });

            router.push("/contact");
        }
    }
}
