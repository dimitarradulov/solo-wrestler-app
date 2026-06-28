package com.dimitarradulov.solowrestler.video;

import android.content.Intent;

import androidx.annotation.Nullable;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.regex.Pattern;

@CapacitorPlugin(name = "TechniqueVideoPlayer")
public class TechniqueVideoPlayerPlugin extends Plugin {
    private static final Pattern VIDEO_ID_PATTERN =
        Pattern.compile("^[A-Za-z0-9_-]{11}$");

    @Nullable
    private static TechniqueVideoPlayerPlugin activeInstance;

    @Nullable
    private PluginCall activeCall;

    @Override
    public void load() {
        activeInstance = this;
    }

    @PluginMethod
    public void open(PluginCall call) {
        String videoId = call.getString("videoId");

        if (videoId == null || !VIDEO_ID_PATTERN.matcher(videoId).matches()) {
            call.reject("A valid YouTube videoId is required.");
            return;
        }

        if (activeCall != null) {
            call.reject("Technique video is already open.");
            return;
        }

        activeCall = call;

        Intent intent = new Intent(getActivity(), TechniqueVideoPlayerActivity.class);
        intent.putExtra(TechniqueVideoPlayerActivity.EXTRA_VIDEO_ID, videoId);

        getActivity().runOnUiThread(() -> getActivity().startActivity(intent));
    }

    static void notifyClosed() {
        if (activeInstance == null) {
            return;
        }

        activeInstance.handleClosed();
    }

    static void notifyOpenFailed(String message) {
        if (activeInstance == null) {
            return;
        }

        activeInstance.handleOpenFailed(message);
    }

    private void handleClosed() {
        if (activeCall == null) {
            return;
        }

        activeCall.resolve();
        activeCall = null;
    }

    private void handleOpenFailed(String message) {
        if (activeCall == null) {
            return;
        }

        activeCall.reject(message);
        activeCall = null;
    }
}
