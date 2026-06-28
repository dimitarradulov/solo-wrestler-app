package com.dimitarradulov.solowrestler;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.dimitarradulov.solowrestler.video.TechniqueVideoPlayerPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TechniqueVideoPlayerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
