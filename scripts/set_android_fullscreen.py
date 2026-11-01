from pathlib import Path
import sys

root=Path(sys.argv[1]) if len(sys.argv)>1 else Path('android')
found=list((root/'app/src/main/java').rglob('MainActivity.java'))
if len(found)!=1:
    raise SystemExit(f'Esperado 1 MainActivity.java, encontrados {len(found)}: {found}')
p=found[0]
t=p.read_text(encoding='utf-8')
if 'extends BridgeActivity' not in t:
    raise SystemExit('MainActivity inesperada: BridgeActivity nao encontrada')
package=t.split('package ',1)[1].split(';',1)[0].strip()
t=f'''package {package};

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {{
    @Override
    protected void onCreate(Bundle savedInstanceState) {{
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {{
            WindowManager.LayoutParams attributes = getWindow().getAttributes();
            attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attributes);
        }}
        ativarModoImersivo();
    }}

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {{
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) ativarModoImersivo();
    }}

    private void ativarModoImersivo() {{
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        );
    }}
}}
'''
p.write_text(t,encoding='utf-8')
print('Android fullscreen imersivo atualizado:',p)
