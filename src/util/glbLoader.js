import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export default function Loader(path) {
    const loader = new GLTFLoader()
        .setDRACOLoader(new DRACOLoader().setDecoderPath("assets/wasm/"))
        .setKTX2Loader(new KTX2Loader().setTranscoderPath("assets/wasm/"))
        .setMeshoptDecoder(MeshoptDecoder);

    return new Promise((resolve) => {
        loader.load(path, (gltf) => {
            // console.log(gltf)
            const scene = gltf.scene || gltf.scenes[0];
            if (!scene) {
                throw new Error(
                    "This model contains no scene, and cannot be viewed here. However," +
                    " it may contain individual 3D resources."
                );
            }

            resolve(scene);
        });
    });
}
