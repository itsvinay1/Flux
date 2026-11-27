package com.flux.app;

import android.app.Dialog;
import android.os.Bundle;
import android.os.Message;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private Dialog popupDialog;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView mainWebView = this.bridge.getWebView();
                WebSettings settings = mainWebView.getSettings();

                // 1. Strip WebView markers from User-Agent so Google OAuth does not block with 403 disallowed_useragent
                String defaultUa = settings.getUserAgentString();
                if (defaultUa != null) {
                    String cleanUa = defaultUa.replace("; wv", "").replaceAll("Version\\/\\d+(\\.\\d+)*\\s*", "");
                    settings.setUserAgentString(cleanUa);
                }

                // 2. Enable Popups and Window Management
                settings.setJavaScriptCanOpenWindowsAutomatically(true);
                settings.setSupportMultipleWindows(true);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);

                // 3. Handle window.open popups for Firebase & Google OAuth
                mainWebView.setWebChromeClient(new WebChromeClient() {
                    @Override
                    public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                        try {
                            if (popupDialog != null && popupDialog.isShowing()) {
                                popupDialog.dismiss();
                            }

                            WebView popupWebView = new WebView(MainActivity.this);
                            WebSettings popupSettings = popupWebView.getSettings();
                            popupSettings.setJavaScriptEnabled(true);
                            popupSettings.setDomStorageEnabled(true);
                            popupSettings.setDatabaseEnabled(true);
                            popupSettings.setJavaScriptCanOpenWindowsAutomatically(true);
                            popupSettings.setSupportMultipleWindows(true);

                            String pUa = popupSettings.getUserAgentString();
                            if (pUa != null) {
                                String cleanPUa = pUa.replace("; wv", "").replaceAll("Version\\/\\d+(\\.\\d+)*\\s*", "");
                                popupSettings.setUserAgentString(cleanPUa);
                            }

                            popupDialog = new Dialog(MainActivity.this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
                            popupDialog.setContentView(popupWebView);

                            popupWebView.setWebChromeClient(new WebChromeClient() {
                                @Override
                                public void onCloseWindow(WebView window) {
                                    try {
                                        if (popupDialog != null && popupDialog.isShowing()) {
                                            popupDialog.dismiss();
                                        }
                                    } catch (Exception ignored) {}
                                }
                            });

                            popupWebView.setWebViewClient(new WebViewClient() {
                                @Override
                                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                                    return false;
                                }
                            });

                            WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                            transport.setWebView(popupWebView);
                            resultMsg.sendToTarget();

                            popupDialog.show();
                            return true;
                        } catch (Exception e) {
                            e.printStackTrace();
                            return false;
                        }
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        if (popupDialog != null && popupDialog.isShowing()) {
            try {
                popupDialog.dismiss();
            } catch (Exception ignored) {}
        }
        super.onDestroy();
    }
}
