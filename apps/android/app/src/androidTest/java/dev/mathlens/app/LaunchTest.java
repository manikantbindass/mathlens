package dev.mathlens.app;
import android.test.ActivityInstrumentationTestCase2;
import android.webkit.WebView;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
@SuppressWarnings("deprecation")
public class LaunchTest extends ActivityInstrumentationTestCase2<MainActivity> {
    public LaunchTest(){super(MainActivity.class);}
    public void testHostedWorkspaceLoadsWithoutNativeBridge() throws Exception {
        MainActivity activity=getActivity();
        WebView webView=activity.findViewById(R.id.workspace);
        boolean loaded=false;
        for(int attempt=0;attempt<60;attempt++){
            AtomicReference<String> value=new AtomicReference<>("");CountDownLatch latch=new CountDownLatch(1);
            getInstrumentation().runOnMainSync(()->webView.evaluateJavascript("JSON.stringify({heading:document.querySelector('main h1')?.textContent||'',bridge:typeof window.MathLensNative})",result->{value.set(result);latch.countDown();}));
            assertTrue("WebView must respond",latch.await(5,TimeUnit.SECONDS));
            if(value.get().contains("clearer view")&&value.get().contains("undefined")){loaded=true;break;}
            Thread.sleep(1000);
        }
        assertTrue("Hosted MathLens overview must load over HTTPS without a native JS bridge",loaded);
    }
}
