layerTitle = 'DAO';

helpers['updatePrincipalText'] = () => {
    ea.updateScene({
        elements: ea.getSceneElements().map(it => {
            if (it.id == principalElementId) {
                it.text = ic.plug.principalId;
                it.width = it.text.length * letterWidth['principal'];
            }
            return { ...it };
        })
    })
};

helpers['updateStarsText'] = (balance) => {
    ea.updateScene({
        elements: ea.getSceneElements().map(element => {
            if (element.id === starsElementId) {
                element.text = `${balance}`;
                element.width = element.text.length * letterWidth['stars'];
            }
            return { ...element };
        })
    });
};

helpers['updateICPText'] = (balance) => {
    ea.updateScene({
        elements: ea.getSceneElements().map(element => {
            if (element.id === icpElementId) {
                element.text = `${balance}`;
                element.width = element.text.length * letterWidth['icp'];
            }
            return { ...element };
        })
    });
}

macros['Refresh STARS'] = async () => {
    try {
        if (!ic?.plug?.accountId) {
            if (!await macros['Connect Plug']()) {
                return;
            }
        }

        const accountId = ic.plug.accountId;
        const response = await fetch(`https://icp-stars-balance.deno.dev/?accountId=${accountId}`);
        const balance = await response.text();

        if (response.ok) {
            ea.setToast({ message: "STARS balance updated" });
            helpers.updateStarsText(balance);
        } else {
            throw new Error(`Error fetching balance: ${response.statusText}`);
        }
    } catch (error) {
        ea.setToast({ message: `Failed to update STARS balance: ${error.message}` });
    }
}
macros['Refresh ICP'] = async () => {
    try {
        if (!ic?.plug?.accountId) {
            if (!await macros['Connect Plug']()) {
                return;
            }
        }

        const accountId = ic.plug.accountId;
        const response = await fetch(`https://icp-balance.deno.dev/?accountId=${accountId}`);
        const balance = await response.text();

        if (response.ok) {
            ea.setToast({ message: "ICP balance updated" });
            helpers.updateICPText(balance);
        } else {
            throw new Error(`Error fetching balance: ${response.statusText}`);
        }
    } catch (error) {
        ea.setToast({ message: `Failed to update ICP balance: ${error.message}` });
    }
}
macros['Connect Plug'] = async () => {
    try {
        if (!window.ic?.plug) {
            ea.setToast({ message: 'Plug Wallet not found, make sure extension installed and try again' });
            return;
        }
        if (!await window.ic?.plug?.requestConnect()) {
            ea.setToast({ message: "Plug wallet connection was refused" });
            return;
        }
        helpers.updatePrincipalText();
        ea.setToast({ message: "Plug wallet is connected" });
        return true;
    } catch (e) {
        console.error("An unexpected error occurred:", e);
        ea.setToast({ message: "An error occurred during connection." });
    }
}

macros['Purchase STARS'] = async () => {
    try {
        if (!await macros['Connect Plug']()) {
            return;
        }

        ea.setToast({ message: "Plug wallet is connected" });
        helpers.updatePrincipalText();

        const xit = window.prompt("Please enter ICP amount to convert:");
        const ixit = parseFloat(xit).toFixed(8);

        if (ixit > 0) {
            console.log(`User input for transfer amount: ${ixit}`);
            ea.setToast({ message: "Checking balance..." });

            const zit = await window.ic?.plug?.requestBalance();
            const izit = parseFloat(zit[0].amount).toFixed(8);
            console.log(`Current wallet balance:`, izit);

            const [mixit, nixit] = ixit.split('.').map(it => Number(it));
            const [mizit, nizit] = izit.split('.').map(it => Number(it));

            const kit = (() => {
                if (mizit > mixit) return true;
                if (nizit >= nixit) return true;
                return false;
            })();

            if (kit) {
                ea.setToast({ message: "Thanks! Processing transaction..." });

                const imixit = mixit * 1e8;
                const nimixit = imixit + nixit;

                const requestTransferArg = {
                    to: 'rluj7-udbu7-7ksiq-kcaw6-3hedq-itl47-td4yw-afwzq-v54ml-mgl3j-aqe',
                    amount: nimixit,
                };
                console.log(`Requesting transfer with the following details:`, requestTransferArg);
                const transfer = await window.ic?.plug?.requestTransfer(requestTransferArg);

                console.log(`Transfer response:`, transfer);

                if (transfer.height) {
                    ea.setToast({ message: `Purchase completed at block ${transfer.height}` });
                } else {
                    ea.setToast({ message: `Unexpected purchase response: ${JSON.stringify(transfer)}` })
                }
            } else {
                ea.setToast({ message: "Plug wallet doesn't have enough balance" });
            }
        } else {
            ea.setToast({ message: "No amount entered. Transfer cancelled." });
        }
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        ea.setToast({ message: "An error occurred during the transaction process." });
    }
}

elements = getElements()

metaElementId = 'metaElementId';
walletElementId = elements.find(it => it.type == 'text' && it.text == 'Your Wallet').id
principalElementId = elements.find(it => it.type == 'text' && it.text == 'Not Connected').id
starsElementId = elements.find(it => it.type == 'text' && it.text == '0 STARS').id
icpElementId = elements.find(it => it.type == 'text' && it.text == '0 ICP').id

letterWidth = {
    wallet: elements.find(it => it.id == walletElementId).width / elements.find(it => it.id == walletElementId).text.length,
    principal: elements.find(it => it.id == principalElementId).width / elements.find(it => it.id == principalElementId).text.length,
    stars: elements.find(it => it.id == starsElementId).width / elements.find(it => it.id == starsElementId).text.length,
    icp: elements.find(it => it.id == icpElementId).width / elements.find(it => it.id == icpElementId).text.length,
}

elements = elements.map(it => {
    if (it.id == walletElementId) {
        it.boundElements = it.boundElements.filter(it => it.type != 'meta')
        // it.boundElements.push({ type: 'meta', id: metaElementId })
    }
    return it;
})

metaElements.push({
    id: metaElementId,
    type: 'meta',
    startBinding: {
        elementId: walletElementId,
    },
    endBinding: {
        elementId: 'intertwingularity'
    },
    boundElements: [{
        type: 'text',
        text: 'Purchase STARS'
    }]
})

window.permanentSelectedElementIds = { [walletElementId]: true }

function getElements() {
    return [
        {
            "type": "text",
            "version": 2306,
            "versionNonce": 1883178860,
            "isDeleted": false,
            "id": "UjKczsoW56uOLRrzd-dFZ",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 454.92068041077357,
            "y": 155.0315134086154,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 283.3563232421875,
            "height": 81.62148761732409,
            "seed": 1890650788,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [
                {
                    "id": "Gvi_daVAcJWOx3TygX5oM",
                    "type": "arrow"
                }
            ],
            "updated": 1702175511571,
            "link": null,
            "locked": false,
            "fontSize": 65.29719009385927,
            "fontFamily": 1,
            "text": "Galaxy.",
            "textAlign": "left",
            "verticalAlign": "top",
            "containerId": null,
            "originalText": "Galaxy.",
            "lineHeight": 1.25,
            "baseline": 59
        },
        {
            "type": "text",
            "version": 177,
            "versionNonce": 935951012,
            "isDeleted": false,
            "id": "JKpoBzxxrNNrbpMQDGOcY",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 734.6999304849035,
            "y": 170.62074770167158,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 269.84661865234375,
            "height": 41.859229930871194,
            "seed": 50337316,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [],
            "updated": 1702173173733,
            "link": null,
            "locked": false,
            "fontSize": 33.48738394469696,
            "fontFamily": 1,
            "text": "Decentralized",
            "textAlign": "left",
            "verticalAlign": "top",
            "containerId": null,
            "originalText": "Decentralized",
            "lineHeight": 1.25,
            "baseline": 30
        },
        {
            "type": "text",
            "version": 185,
            "versionNonce": 1809899417,
            "isDeleted": false,
            "id": "Y_iLXbD5UItEbFmcX1UYR",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 734.6862637403683,
            "y": 208.0268226982381,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 249.08917236328125,
            "height": 41.859229930871194,
            "seed": 509718948,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [],
            "updated": 1702174764674,
            "link": null,
            "locked": false,
            "fontSize": 33.48738394469696,
            "fontFamily": 1,
            "text": "Organization",
            "textAlign": "left",
            "verticalAlign": "top",
            "containerId": null,
            "originalText": "Organization",
            "lineHeight": 1.25,
            "baseline": 30
        },
        {
            "type": "arrow",
            "version": 456,
            "versionNonce": 1176312940,
            "isDeleted": false,
            "id": "Gvi_daVAcJWOx3TygX5oM",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 573.4792296589824,
            "y": 244.15360892490781,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 1.321827977431326,
            "height": 103.81785079999673,
            "seed": 570678564,
            "groupIds": [],
            "frameId": null,
            "roundness": {
                "type": 2
            },
            "boundElements": [
                {
                    "type": "text",
                    "id": "QhfBk00TwzDbrBejdW9Ur"
                }
            ],
            "updated": 1702175511572,
            "link": null,
            "locked": false,
            "startBinding": {
                "focus": 0.15832879529271462,
                "gap": 7.500607898968326,
                "elementId": "UjKczsoW56uOLRrzd-dFZ"
            },
            "endBinding": {
                "focus": -0.4313051185838058,
                "gap": 6.862136655467225,
                "elementId": "Z2jk600puXpjvGYKZ-xG9"
            },
            "lastCommittedPoint": null,
            "startArrowhead": null,
            "endArrowhead": "arrow",
            "points": [
                [
                    0,
                    0
                ],
                [
                    -1.321827977431326,
                    103.81785079999673
                ]
            ]
        },
        {
            "type": "text",
            "version": 20,
            "versionNonce": 1949590359,
            "isDeleted": false,
            "id": "QhfBk00TwzDbrBejdW9Ur",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 541.3203291113123,
            "y": 285.11201857783584,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 86.79931640625,
            "height": 25,
            "seed": 1465161892,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [],
            "updated": 1702174747066,
            "link": null,
            "locked": false,
            "fontSize": 20,
            "fontFamily": 1,
            "text": "Mission",
            "textAlign": "center",
            "verticalAlign": "middle",
            "containerId": "Gvi_daVAcJWOx3TygX5oM",
            "originalText": "Mission",
            "lineHeight": 1.25,
            "baseline": 18
        },
        {
            "type": "text",
            "version": 261,
            "versionNonce": 1384815257,
            "isDeleted": false,
            "id": "Z2jk600puXpjvGYKZ-xG9",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 402.73725876600736,
            "y": 354.8335963803718,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 595.1953125,
            "height": 25,
            "seed": 704767012,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [
                {
                    "id": "Gvi_daVAcJWOx3TygX5oM",
                    "type": "arrow"
                }
            ],
            "updated": 1702174762243,
            "link": null,
            "locked": false,
            "fontSize": 20,
            "fontFamily": 1,
            "text": "Re-discovering better writing tools for humanity",
            "textAlign": "left",
            "verticalAlign": "top",
            "containerId": null,
            "originalText": "Re-discovering better writing tools for humanity",
            "lineHeight": 1.25,
            "baseline": 18
        },
        {
            "type": "text",
            "version": 3179,
            "versionNonce": 1733546453,
            "isDeleted": false,
            "id": "pBGbAtVVA3gixLjRuBst-",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 394.55973711428663,
            "y": 405.945379756598,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 136.1199188232422,
            "height": 54.89069595499703,
            "seed": 1610203044,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [
                {
                    "id": "CyLiuOUGuYgvDpTUCCBr5",
                    "type": "arrow"
                }
            ],
            "updated": 1702218754523,
            "link": null,
            "locked": false,
            "fontSize": 43.91255676399762,
            "fontFamily": 1,
            "text": "1 ICP",
            "textAlign": "left",
            "verticalAlign": "top",
            "containerId": null,
            "originalText": "1 ICP",
            "lineHeight": 1.25,
            "baseline": 40
        },
        {
            "type": "text",
            "version": 1554,
            "versionNonce": 1592045909,
            "isDeleted": false,
            "id": "-dKy-1mC816D67fWyv3zt",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 861.290086102536,
            "y": 397.8599377834727,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 190.56788635253906,
            "height": 54.89069595499703,
            "seed": 1365912356,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [
                {
                    "id": "CyLiuOUGuYgvDpTUCCBr5",
                    "type": "arrow"
                }
            ],
            "updated": 1702199369727,
            "link": null,
            "locked": false,
            "fontSize": 43.91255676399762,
            "fontFamily": 1,
            "text": "7 STARS",
            "textAlign": "left",
            "verticalAlign": "top",
            "containerId": null,
            "originalText": "7 STARS",
            "lineHeight": 1.25,
            "baseline": 40
        },
        {
            "type": "arrow",
            "version": 5957,
            "versionNonce": 1651450005,
            "isDeleted": false,
            "id": "CyLiuOUGuYgvDpTUCCBr5",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 545.2241883891782,
            "y": 431.31927403071705,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 301.7472943652682,
            "height": 5.880463893670822,
            "seed": 549529252,
            "groupIds": [],
            "frameId": null,
            "roundness": {
                "type": 2
            },
            "boundElements": [
                {
                    "type": "text",
                    "id": "GduVBLqcMUq6bhXjdwbD1"
                }
            ],
            "updated": 1702218754524,
            "link": null,
            "locked": false,
            "startBinding": {
                "elementId": "pBGbAtVVA3gixLjRuBst-",
                "focus": -0.01601177746891697,
                "gap": 14.544532451649246
            },
            "endBinding": {
                "elementId": "-dKy-1mC816D67fWyv3zt",
                "focus": 0.06833655934271753,
                "gap": 14.31860334808971
            },
            "lastCommittedPoint": null,
            "startArrowhead": null,
            "endArrowhead": "arrow",
            "points": [
                [
                    0,
                    0
                ],
                [
                    301.7472943652682,
                    -5.880463893670822
                ]
            ]
        },
        {
            "type": "text",
            "version": 65,
            "versionNonce": 2127388313,
            "isDeleted": false,
            "id": "GduVBLqcMUq6bhXjdwbD1",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 629.812618286656,
            "y": 417.86645020636234,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 161.19873046875,
            "height": 25,
            "seed": 1923920420,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [],
            "updated": 1702174751144,
            "link": null,
            "locked": false,
            "fontSize": 20,
            "fontFamily": 1,
            "text": "Exchange Rate",
            "textAlign": "center",
            "verticalAlign": "middle",
            "containerId": "CyLiuOUGuYgvDpTUCCBr5",
            "originalText": "Exchange Rate",
            "lineHeight": 1.25,
            "baseline": 18
        },
        {
            "type": "text",
            "version": 3834,
            "versionNonce": 1762471573,
            "isDeleted": false,
            "id": "1hkS10i8MXYdEpTIf8nf2",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 545.2682759025427,
            "y": 466.858482705812,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 299.46380615234375,
            "height": 54.89069595499703,
            "seed": 349777465,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [
                {
                    "id": "EJjJiWiO-6KJZT31e5gtK",
                    "type": "arrow"
                },
                {
                    "id": "cOzNm9xD8Xszqt5NUcOUP",
                    "type": "arrow"
                },
                {
                    "id": "papBkPkCI-eSKXA3qvv3U",
                    "type": "arrow"
                },
                {
                    "type": "meta",
                    "id": "metaElementId"
                },
                {
                    "type": "meta",
                    "id": "metaElementId"
                },
                {
                    "type": "meta",
                    "id": "metaElementId"
                }
            ],
            "updated": 1702218914177,
            "link": null,
            "locked": false,
            "fontSize": 43.91255676399762,
            "fontFamily": 1,
            "text": "Your Wallet",
            "textAlign": "left",
            "verticalAlign": "top",
            "containerId": null,
            "originalText": "Your Wallet",
            "lineHeight": 1.25,
            "baseline": 40
        },
        {
            "type": "arrow",
            "version": 2015,
            "versionNonce": 1703431509,
            "isDeleted": false,
            "id": "EJjJiWiO-6KJZT31e5gtK",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 684.9148415726461,
            "y": 528.9517691332549,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 12.568222422728127,
            "height": 210.52735130552537,
            "seed": 205093156,
            "groupIds": [],
            "frameId": null,
            "roundness": {
                "type": 2
            },
            "boundElements": [
                {
                    "type": "text",
                    "id": "-hXxdauWPCLa9h7fZb32E"
                }
            ],
            "updated": 1702218914177,
            "link": null,
            "locked": false,
            "startBinding": {
                "elementId": "1hkS10i8MXYdEpTIf8nf2",
                "focus": 0.0802740795037237,
                "gap": 7.202590472445877
            },
            "endBinding": {
                "elementId": "7HqZnX1XAUiQJ9DZlCgDL",
                "focus": 0.19361565634997094,
                "gap": 6.8688403980186195
            },
            "lastCommittedPoint": null,
            "startArrowhead": null,
            "endArrowhead": "triangle",
            "points": [
                [
                    0,
                    0
                ],
                [
                    12.568222422728127,
                    210.52735130552537
                ]
            ]
        },
        {
            "type": "text",
            "version": 89,
            "versionNonce": 295215835,
            "isDeleted": false,
            "id": "-hXxdauWPCLa9h7fZb32E",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 631.4871201663243,
            "y": 623.0006010360175,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 120.078125,
            "height": 23,
            "seed": 544650404,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [],
            "updated": 1702218837815,
            "link": null,
            "locked": false,
            "fontSize": 20,
            "fontFamily": 2,
            "text": "Connect Plug",
            "textAlign": "center",
            "verticalAlign": "middle",
            "containerId": "EJjJiWiO-6KJZT31e5gtK",
            "originalText": "Connect Plug",
            "lineHeight": 1.15,
            "baseline": 19
        },
        {
            "type": "text",
            "version": 479,
            "versionNonce": 1695634869,
            "isDeleted": false,
            "id": "dmngsSpw5kzGFA6ilYuno",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 298.7907007235578,
            "y": 652.9554552190359,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 78.70834350585938,
            "height": 31.747295774117,
            "seed": 1082163236,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [
                {
                    "id": "cOzNm9xD8Xszqt5NUcOUP",
                    "type": "arrow"
                }
            ],
            "updated": 1702218772439,
            "link": null,
            "locked": false,
            "fontSize": 25.3978366192936,
            "fontFamily": 1,
            "text": "0 ICP",
            "textAlign": "left",
            "verticalAlign": "top",
            "containerId": null,
            "originalText": "0 ICP",
            "lineHeight": 1.25,
            "baseline": 23
        },
        {
            "type": "arrow",
            "version": 1934,
            "versionNonce": 149977813,
            "isDeleted": false,
            "id": "papBkPkCI-eSKXA3qvv3U",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 829.2840994534259,
            "y": 528.2293301744769,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 192.64329018090154,
            "height": 104.18210350771005,
            "seed": 1682234276,
            "groupIds": [],
            "frameId": null,
            "roundness": {
                "type": 2
            },
            "boundElements": [
                {
                    "type": "text",
                    "id": "sgKJP5SZncAJLXDyqgz5y"
                }
            ],
            "updated": 1702218914177,
            "link": null,
            "locked": false,
            "startBinding": {
                "elementId": "1hkS10i8MXYdEpTIf8nf2",
                "focus": -0.3569531873829464,
                "gap": 6.48015151366792
            },
            "endBinding": {
                "elementId": "OD3Pd46akwDAD39w3q4Y_",
                "focus": 0.6299401661742096,
                "gap": 11.462682992542568
            },
            "lastCommittedPoint": null,
            "startArrowhead": null,
            "endArrowhead": "triangle",
            "points": [
                [
                    0,
                    0
                ],
                [
                    192.64329018090154,
                    104.18210350771005
                ]
            ]
        },
        {
            "type": "text",
            "version": 52,
            "versionNonce": 1480975163,
            "isDeleted": false,
            "id": "sgKJP5SZncAJLXDyqgz5y",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 848.4397415268968,
            "y": 558.7793663033319,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 161.19873046875,
            "height": 25,
            "seed": 1441908516,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [],
            "updated": 1702218768040,
            "link": null,
            "locked": false,
            "fontSize": 20,
            "fontFamily": 1,
            "text": "Refresh STARS",
            "textAlign": "center",
            "verticalAlign": "middle",
            "containerId": "papBkPkCI-eSKXA3qvv3U",
            "originalText": "Refresh STARS",
            "lineHeight": 1.25,
            "baseline": 18
        },
        {
            "type": "arrow",
            "version": 2026,
            "versionNonce": 1264237589,
            "isDeleted": false,
            "id": "cOzNm9xD8Xszqt5NUcOUP",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 558.3742136069959,
            "y": 529.0580973462211,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 179.96571669409911,
            "height": 123.03509481420485,
            "seed": 1777681060,
            "groupIds": [],
            "frameId": null,
            "roundness": {
                "type": 2
            },
            "boundElements": [
                {
                    "type": "text",
                    "id": "vsheap_6x8Iq3Hk5dbXBJ"
                }
            ],
            "updated": 1702218914177,
            "link": null,
            "locked": false,
            "startBinding": {
                "elementId": "1hkS10i8MXYdEpTIf8nf2",
                "focus": 0.4517702122393493,
                "gap": 7.308918685412095
            },
            "endBinding": {
                "elementId": "dmngsSpw5kzGFA6ilYuno",
                "focus": 0.2522451286105762,
                "gap": 1.2532365162776387
            },
            "lastCommittedPoint": null,
            "startArrowhead": null,
            "endArrowhead": "triangle",
            "points": [
                [
                    0,
                    0
                ],
                [
                    -179.96571669409911,
                    123.03509481420485
                ]
            ]
        },
        {
            "type": "text",
            "version": 54,
            "versionNonce": 1138696475,
            "isDeleted": false,
            "id": "vsheap_6x8Iq3Hk5dbXBJ",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 415.3502910930456,
            "y": 571.5207830244897,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 136.39892578125,
            "height": 25,
            "seed": 922570276,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [],
            "updated": 1702218761359,
            "link": null,
            "locked": false,
            "fontSize": 20,
            "fontFamily": 1,
            "text": "Refresh ICP",
            "textAlign": "center",
            "verticalAlign": "middle",
            "containerId": "cOzNm9xD8Xszqt5NUcOUP",
            "originalText": "Refresh ICP",
            "lineHeight": 1.25,
            "baseline": 18
        },
        {
            "type": "text",
            "version": 681,
            "versionNonce": 167513141,
            "isDeleted": false,
            "id": "OD3Pd46akwDAD39w3q4Y_",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 964.1821227603566,
            "y": 643.8741166747295,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 110.19168090820312,
            "height": 31.747295774117,
            "seed": 1308092836,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [
                {
                    "id": "Gvi_daVAcJWOx3TygX5oM",
                    "type": "arrow"
                },
                {
                    "id": "cOzNm9xD8Xszqt5NUcOUP",
                    "type": "arrow"
                },
                {
                    "id": "papBkPkCI-eSKXA3qvv3U",
                    "type": "arrow"
                }
            ],
            "updated": 1702218776540,
            "link": null,
            "locked": false,
            "fontSize": 25.3978366192936,
            "fontFamily": 1,
            "text": "0 STARS",
            "textAlign": "left",
            "verticalAlign": "top",
            "containerId": null,
            "originalText": "0 STARS",
            "lineHeight": 1.25,
            "baseline": 23
        },
        {
            "type": "text",
            "version": 652,
            "versionNonce": 1779644635,
            "isDeleted": false,
            "id": "7HqZnX1XAUiQJ9DZlCgDL",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": 576.5255206013222,
            "y": 746.3479608367988,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": 204.64169311523438,
            "height": 31.747295774117,
            "seed": 1913853220,
            "groupIds": [],
            "frameId": null,
            "roundness": null,
            "boundElements": [
                {
                    "id": "EJjJiWiO-6KJZT31e5gtK",
                    "type": "arrow"
                }
            ],
            "updated": 1702218786824,
            "link": null,
            "locked": false,
            "fontSize": 25.3978366192936,
            "fontFamily": 1,
            "text": "Not Connected",
            "textAlign": "left",
            "verticalAlign": "top",
            "containerId": null,
            "originalText": "Not Connected",
            "lineHeight": 1.25,
            "baseline": 23
        }
    ]
}
