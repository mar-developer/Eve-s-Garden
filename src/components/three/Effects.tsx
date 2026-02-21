import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";

export const Effects = () => {
  return (
    <EffectComposer>
      <Bloom 
        luminanceThreshold={1} 
        mipmapBlur 
        intensity={1.5} 
      />
      <DepthOfField 
        focusDistance={0} 
        focalLength={0.02} 
        bokehScale={2} 
        height={480} 
      />
    </EffectComposer>
  );
};
