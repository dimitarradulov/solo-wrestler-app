package com.dimitarradulov.solowrestler.video;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class TechniqueVideoPlayerActivity extends AppCompatActivity {
    static final String EXTRA_VIDEO_ID = "videoId";
    static final String EXTRA_VIDEO_NOTE = "videoNote";

    private static final long LOAD_TIMEOUT_MS = 15_000L;
    private static final String BASE_URL_TEMPLATE = "https://%s.app";

    @Nullable
    private WebView webView;
    @Nullable
    private FrameLayout fullscreenContainer;
    @Nullable
    private View fullscreenView;
    @Nullable
    private WebChromeClient.CustomViewCallback fullscreenCallback;
    @Nullable
    private LinearLayout loadingOverlay;
    @Nullable
    private LinearLayout errorOverlay;
    @Nullable
    private TextView errorMessageView;

    private final Handler timeoutHandler = new Handler(Looper.getMainLooper());
    private final Runnable timeoutRunnable = () ->
        showError("Technique Video could not start within 15 seconds.");

    @Nullable
    private String videoId;
    @Nullable
    private String videoNote;
    private boolean hasFinished = false;
    private boolean isReady = false;
    private boolean isClosing = false;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        videoId = getIntent().getStringExtra(EXTRA_VIDEO_ID);
        videoNote = getIntent().getStringExtra(EXTRA_VIDEO_NOTE);

        if (videoId == null) {
            TechniqueVideoPlayerPlugin.notifyOpenFailed("Missing YouTube video ID.");
            finish();
            return;
        }

        setContentView(buildContentView());
        loadPlayer();
    }

    @Override
    protected void onPause() {
        super.onPause();
        pausePlayback();
    }

    @Override
    protected void onDestroy() {
        timeoutHandler.removeCallbacks(timeoutRunnable);

        if (webView != null) {
          webView.removeJavascriptInterface("SoloTechniqueVideoBridge");
          webView.loadUrl("about:blank");
          webView.stopLoading();
          webView.destroy();
          webView = null;
        }

        super.onDestroy();

        if (!isClosing) {
            TechniqueVideoPlayerPlugin.notifyClosed();
            isClosing = true;
        }
    }

    @Override
    public void onBackPressed() {
        closePlayer();
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    private View buildContentView() {
        int pagePadding = dp(16);
        int frameHeight = Math.round(getResources().getDisplayMetrics().widthPixels * 9f / 16f);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#121417"));
        root.setPadding(pagePadding, pagePadding, pagePadding, pagePadding);
        root.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        ViewCompat.setOnApplyWindowInsetsListener(root, (view, windowInsets) -> {
            Insets systemBars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());

            view.setPadding(
                pagePadding,
                pagePadding + systemBars.top,
                pagePadding,
                pagePadding + systemBars.bottom
            );

            return windowInsets;
        });

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setLayoutParams(new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        TextView title = new TextView(this);
        title.setText("Technique Video");
        title.setTextColor(Color.WHITE);
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
        title.setTypeface(title.getTypeface(), android.graphics.Typeface.BOLD);

        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
            0,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            1f
        );
        title.setLayoutParams(titleParams);

        Button closeButton = buildOverlayButton("Close");
        closeButton.setOnClickListener((ignored) -> closePlayer());

        bar.addView(title);
        bar.addView(closeButton);

        FrameLayout playerFrame = new FrameLayout(this);
        LinearLayout.LayoutParams frameParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            frameHeight
        );
        frameParams.topMargin = dp(16);
        playerFrame.setLayoutParams(frameParams);
        playerFrame.setBackgroundColor(Color.BLACK);

        webView = new WebView(this);
        webView.setLayoutParams(new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        webView.setBackgroundColor(Color.BLACK);
        webView.addJavascriptInterface(new TechniqueVideoBridge(), "SoloTechniqueVideoBridge");

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccess(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(
                WebView view,
                @NonNull WebResourceRequest request
            ) {
                String scheme = request.getUrl().getScheme();

                if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
                    return true;
                }

                return false;
            }

            @Override
            public void onReceivedError(
                WebView view,
                @NonNull WebResourceRequest request,
                @NonNull WebResourceError error
            ) {
                if (!request.isForMainFrame()) {
                    return;
                }

                showError("Technique Video could not load.");
            }
        });
        webView.setWebChromeClient(new PlayerChromeClient());

        loadingOverlay = buildLoadingOverlay();
        errorOverlay = buildErrorOverlay();
        errorOverlay.setVisibility(View.GONE);

        playerFrame.addView(webView);
        playerFrame.addView(loadingOverlay);
        playerFrame.addView(errorOverlay);

        fullscreenContainer = new FrameLayout(this);
        fullscreenContainer.setBackgroundColor(Color.BLACK);
        fullscreenContainer.setVisibility(View.GONE);
        fullscreenContainer.setLayoutParams(new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            0,
            1f
        ));

        root.addView(bar);
        if (videoNote != null && !videoNote.isBlank()) {
            TextView note = new TextView(this);
            note.setText(videoNote);
            note.setTextColor(Color.parseColor("#E2E8F0"));
            note.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
            LinearLayout.LayoutParams noteParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            );
            noteParams.topMargin = dp(16);
            note.setLayoutParams(noteParams);
            root.addView(note);
            frameParams.topMargin = dp(12);
        }
        root.addView(playerFrame);
        root.addView(fullscreenContainer);
        ViewCompat.requestApplyInsets(root);

        return root;
    }

    private LinearLayout buildLoadingOverlay() {
        LinearLayout overlay = new LinearLayout(this);
        overlay.setOrientation(LinearLayout.VERTICAL);
        overlay.setGravity(Gravity.CENTER);
        overlay.setBackgroundColor(Color.BLACK);
        overlay.setLayoutParams(new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        ProgressBar progress = new ProgressBar(this);
        TextView label = new TextView(this);
        label.setText("Loading video…");
        label.setTextColor(Color.WHITE);
        label.setPadding(0, dp(12), 0, 0);

        overlay.addView(progress);
        overlay.addView(label);

        return overlay;
    }

    private LinearLayout buildErrorOverlay() {
        LinearLayout overlay = new LinearLayout(this);
        overlay.setOrientation(LinearLayout.VERTICAL);
        overlay.setGravity(Gravity.CENTER);
        overlay.setBackgroundColor(Color.BLACK);
        overlay.setPadding(dp(24), dp(24), dp(24), dp(24));
        overlay.setLayoutParams(new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        TextView title = new TextView(this);
        title.setText("Unable to load video");
        title.setTextColor(Color.WHITE);
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
        title.setTypeface(title.getTypeface(), android.graphics.Typeface.BOLD);

        errorMessageView = new TextView(this);
        errorMessageView.setTextColor(Color.WHITE);
        errorMessageView.setGravity(Gravity.CENTER);
        errorMessageView.setPadding(0, dp(12), 0, dp(16));

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.setGravity(Gravity.CENTER);

        Button retryButton = buildOverlayButton("Retry");
        retryButton.setOnClickListener((ignored) -> loadPlayer());

        Button closeButton = buildOverlayButton("Close");
        closeButton.setOnClickListener((ignored) -> closePlayer());

        actions.addView(retryButton);
        actions.addView(closeButton);

        overlay.addView(title);
        overlay.addView(errorMessageView);
        overlay.addView(actions);

        return overlay;
    }

    private Button buildOverlayButton(String label) {
        Button button = new Button(this);
        button.setAllCaps(false);
        button.setText(label);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(dp(6), 0, dp(6), 0);
        button.setLayoutParams(params);
        return button;
    }

    private void loadPlayer() {
        if (webView == null || videoId == null) {
            return;
        }

        isReady = false;
        hasFinished = false;

        if (loadingOverlay != null) {
            loadingOverlay.setVisibility(View.VISIBLE);
        }

        if (errorOverlay != null) {
            errorOverlay.setVisibility(View.GONE);
        }

        timeoutHandler.removeCallbacks(timeoutRunnable);
        timeoutHandler.postDelayed(timeoutRunnable, LOAD_TIMEOUT_MS);

        webView.loadDataWithBaseURL(
            String.format(BASE_URL_TEMPLATE, getPackageName()),
            buildPlayerHtml(videoId, getPackageName()),
            "text/html",
            "utf-8",
            null
        );
    }

    private void handleReady() {
        isReady = true;
        timeoutHandler.removeCallbacks(timeoutRunnable);

        if (loadingOverlay != null) {
            loadingOverlay.setVisibility(View.GONE);
        }

        if (errorOverlay != null) {
            errorOverlay.setVisibility(View.GONE);
        }
    }

    private void showError(String message) {
        timeoutHandler.removeCallbacks(timeoutRunnable);

        if (loadingOverlay != null) {
            loadingOverlay.setVisibility(View.GONE);
        }

        if (errorMessageView != null) {
            errorMessageView.setText(message);
        }

        if (errorOverlay != null) {
            errorOverlay.setVisibility(View.VISIBLE);
        }

        pausePlayback();
    }

    private void pausePlayback() {
        if (webView == null || !isReady) {
            return;
        }

        webView.evaluateJavascript(
            "window.__soloPauseVideo && window.__soloPauseVideo();",
            null
        );
    }

    private void closePlayer() {
        if (isClosing) {
            return;
        }

        isClosing = true;
        TechniqueVideoPlayerPlugin.notifyClosed();
        finish();
    }

    private int dp(int value) {
        return Math.round(
            TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                value,
                getResources().getDisplayMetrics()
            )
        );
    }

    private String buildPlayerHtml(String currentVideoId, String packageName) {
        String origin = String.format(BASE_URL_TEMPLATE, packageName);

        return "<!doctype html><html><head><meta charset=\"utf-8\">"
            + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
            + "<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}"
            + "#player{width:100%;height:100%}</style>"
            + "</head><body><div id=\"player\"></div>"
            + "<script>let player=null;"
            + "function onYouTubeIframeAPIReady(){"
            + "player=new YT.Player('player',{videoId:'" + currentVideoId + "',"
            + "playerVars:{autoplay:1,controls:1,playsinline:1,fs:1,rel:0,origin:'" + origin + "'},"
            + "events:{"
            + "onReady:function(){window.SoloTechniqueVideoBridge.onReady();player.playVideo();},"
            + "onError:function(event){window.SoloTechniqueVideoBridge.onError('YouTube error '+event.data);}"
            + "}});}"
            + "window.__soloPauseVideo=function(){if(player){player.pauseVideo();}};"
            + "</script>"
            + "<script src=\"https://www.youtube.com/iframe_api\"></script>"
            + "</body></html>";
    }

    private final class TechniqueVideoBridge {
        @JavascriptInterface
        public void onReady() {
            runOnUiThread(TechniqueVideoPlayerActivity.this::handleReady);
        }

        @JavascriptInterface
        public void onError(String message) {
            runOnUiThread(() -> showError(message));
        }
    }

    private final class PlayerChromeClient extends WebChromeClient {
        @Override
        public boolean onCreateWindow(
            WebView view,
            boolean isDialog,
            boolean isUserGesture,
            android.os.Message resultMsg
        ) {
            return false;
        }

        @Override
        public void onShowCustomView(View view, CustomViewCallback callback) {
            if (fullscreenContainer == null) {
                callback.onCustomViewHidden();
                return;
            }

            fullscreenView = view;
            fullscreenCallback = callback;
            fullscreenContainer.removeAllViews();
            fullscreenContainer.addView(view);
            fullscreenContainer.setVisibility(View.VISIBLE);
            view.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }

        @Override
        public void onHideCustomView() {
            if (fullscreenContainer == null) {
                return;
            }

            fullscreenContainer.removeAllViews();
            fullscreenContainer.setVisibility(View.GONE);

            if (fullscreenCallback != null) {
                fullscreenCallback.onCustomViewHidden();
            }

            fullscreenView = null;
            fullscreenCallback = null;
        }
    }
}
