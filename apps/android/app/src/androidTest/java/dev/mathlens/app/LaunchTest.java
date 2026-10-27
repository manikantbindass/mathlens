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
        assertEquals("APK must require Android 15+",35,activity.getApplicationInfo().minSdkVersion);
        assertEquals("APK must target Android 15",35,activity.getApplicationInfo().targetSdkVersion);
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
        getInstrumentation().runOnMainSync(()->webView.evaluateJavascript(
            "window.__mathlensSmoke='pending';Promise.all([fetch('/api/v1/health').then(r=>{if(!r.ok)throw Error('health');return r.json()}),fetch('/api/v1/calculate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expression:'x^2-4*x+3',operation:'solve'})}).then(r=>{if(!r.ok)throw Error('calculate');return r.json()})]).then(([h,c])=>{window.__mathlensSmoke=h.status==='ok'&&c.result==='x = 1, 3'?'passed':'failed'}).catch(()=>{window.__mathlensSmoke='failed'})",null));
        boolean calculated=false;
        for(int attempt=0;attempt<60;attempt++){
            AtomicReference<String> value=new AtomicReference<>("");CountDownLatch latch=new CountDownLatch(1);
            getInstrumentation().runOnMainSync(()->webView.evaluateJavascript("window.__mathlensSmoke",result->{value.set(result);latch.countDown();}));
            assertTrue("API verification must respond",latch.await(5,TimeUnit.SECONDS));
            assertFalse("Hosted health and calculation must succeed",value.get().contains("failed"));
            if(value.get().contains("passed")){calculated=true;break;}
            Thread.sleep(1000);
        }
        assertTrue("Hosted API must calculate the known roots x = 1, 3",calculated);
    }
}
