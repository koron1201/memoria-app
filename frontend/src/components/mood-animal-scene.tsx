"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinnedScene } from "three/addons/utils/SkeletonUtils.js";
import { MOODS } from "@/lib/mood";

const TARGET_SIZE = 1.8; // モデルの最大辺をこの値にそろえる
const CAMERA_MARGIN = 1.25; // フィット時の余白係数（大きいほど引き）

interface AnimalModelProps {
  src: string;
  actionTick: number;
}

function AnimalModel({ src, actionTick }: AnimalModelProps) {
  const group = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF(src);
  const getThree = useThree((s) => s.get);

  const clonedScene = useMemo(() => cloneSkinnedScene(scene), [scene]);
  const { actions, names } = useAnimations(animations, clonedScene);

  const bouncingRef = useRef(false);
  const actionStartRef = useRef(0);
  const modelRadiusRef = useRef(1);

  useLayoutEffect(() => {
    clonedScene.updateMatrixWorld(true);
    const preBox = new THREE.Box3().setFromObject(clonedScene);
    const preSize = preBox.getSize(new THREE.Vector3());
    const preCenter = preBox.getCenter(new THREE.Vector3());
    const maxDim = Math.max(preSize.x, preSize.y, preSize.z) || 1;
    const scale = TARGET_SIZE / maxDim;

    clonedScene.scale.setScalar(scale);
    clonedScene.position.set(
      -preCenter.x * scale,
      -preCenter.y * scale,
      -preCenter.z * scale,
    );
    clonedScene.updateMatrixWorld(true);

    clonedScene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(clonedScene);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    modelRadiusRef.current = sphere.radius;

    const { camera, size } = getThree();
    const perspective = camera as THREE.PerspectiveCamera;
    const fovRad = (perspective.fov * Math.PI) / 180;
    const aspect = size.width / Math.max(size.height, 1);
    const fitHeightDistance = sphere.radius / Math.sin(fovRad / 2);
    const fitWidthDistance = fitHeightDistance / Math.max(aspect, 0.0001);
    const distance = CAMERA_MARGIN * Math.max(fitHeightDistance, fitWidthDistance);

    perspective.position.set(0, 0, distance);
    perspective.near = Math.max(distance / 100, 0.01);
    perspective.far = distance * 10;
    perspective.lookAt(0, 0, 0);
    perspective.updateProjectionMatrix();
  }, [clonedScene, getThree]);

  useEffect(() => {
    if (actionTick === 0) return;

    if (names.length > 0) {
      const preferred = names.find((n) =>
        /wave|hello|hi|action|dance|jump|greet/i.test(n),
      );
      const idleName =
        names.find((n) =>
          /idle|stand|breathing|default|rest|loop|walk|run/i.test(n),
        ) ?? names[0];
      const name =
        preferred && preferred !== idleName
          ? preferred
          : names.find((n) => n !== idleName) ?? names[0];
      const act = actions[name];
      if (act) {
        act
          .reset()
          .setLoop(THREE.LoopOnce, 1)
          .setEffectiveWeight(1)
          .fadeIn(0.15)
          .play();
        const duration = Math.max(act.getClip().duration, 0.6) * 1000;
        let stopTimer: ReturnType<typeof setTimeout> | undefined;
        const timer = setTimeout(() => {
          act.fadeOut(0.25);
          stopTimer = setTimeout(() => act.stop(), 280);
        }, duration);
        return () => {
          clearTimeout(timer);
          if (stopTimer) clearTimeout(stopTimer);
          act.stop();
        };
      }
    }

    bouncingRef.current = true;
    actionStartRef.current = performance.now();
    const fallbackTimer = setTimeout(() => {
      bouncingRef.current = false;
    }, 900);
    return () => clearTimeout(fallbackTimer);
  }, [actionTick, actions, names]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const r = modelRadiusRef.current;

    if (bouncingRef.current) {
      const progress = Math.min(
        (performance.now() - actionStartRef.current) / 900,
        1,
      );
      const phase = progress * Math.PI * 2;
      group.current.position.y = Math.sin(phase) * r * 0.18;
      group.current.rotation.z = Math.sin(phase * 2) * 0.3;
      group.current.rotation.y = Math.sin(t * 2) * 0.25;
      return;
    }

    // 待機時の呼吸：Y に 1.5% ぶん、ゆったり左右に揺らぎ
    const breathY = Math.sin(t * 1.1) * r * 0.015;
    const swayY = Math.sin(t * 0.35) * 0.035;
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      breathY,
      0.08,
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      swayY,
      0.06,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      0,
      0.1,
    );
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={clonedScene} />
    </group>
  );
}

interface MoodAnimalSceneProps {
  src: string;
  accent?: string;
  className?: string;
  actionTick: number;
  onInteract?: () => void;
}

export function MoodAnimalScene({
  src,
  accent = "#B8A9E8",
  className = "h-72 w-72",
  actionTick,
  onInteract,
}: MoodAnimalSceneProps) {
  const trigger = () => onInteract?.();

  return (
    <div
      className={`relative cursor-pointer select-none ${className}`}
      role="button"
      tabIndex={0}
      aria-label="動物をタップしてあいさつ"
      onClick={trigger}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trigger();
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-60 blur-2xl"
        style={{
          background: `radial-gradient(circle at 50% 55%, ${accent}66 0%, transparent 70%)`,
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 4], fov: 38 }}
        dpr={[1, 2]}
        shadows
        gl={{ alpha: true, antialias: true }}
      >
        <hemisphereLight
          color="#ffffff"
          groundColor="#1a1a2e"
          intensity={0.5}
        />
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[3, 4, 3]}
          intensity={1.05}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* 逆光リム：モードアクセントを乗せて立体感 */}
        <directionalLight
          position={[-2.5, 2.5, -2.5]}
          intensity={0.45}
          color={accent}
        />
        <directionalLight position={[0, -1.5, 2]} intensity={0.18} />
        <Suspense fallback={null}>
          <AnimalModel src={src} actionTick={actionTick} />
          <ContactShadows
            position={[0, -TARGET_SIZE / 2 - 0.05, 0]}
            opacity={0.35}
            scale={TARGET_SIZE * 3}
            blur={2.2}
            far={TARGET_SIZE * 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

MOODS.forEach((m) => {
  try {
    useGLTF.preload(m.glb);
  } catch {
    // SSR 時は無視
  }
});
