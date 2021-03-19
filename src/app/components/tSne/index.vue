<template>
    <div ref="tsnethree" id="tsne-three">
        <div ref="textlabels" id="tsnethree-text" />
    </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import TSNE from "tsne-js";

export default {
    name: "tSne",
    data() {
        return {
            isActive: false,
            camera: null,
            scene: null,
            once: false,
            renderer: null,
            mesh: null,
            pointsMaterial: null,
            pointsContainer: new THREE.Object3D(),
            tsneOutput: null,
            error: "",
            iteration: "",
        };
    },
    props: {
        inputData: {},
        modelColor: { default: "#a2a2a2", type: String },
        dim: { default: 3, type: Number },
        perplexity: { default: 30, type: Number },
        earlyExaggeration: { default: 1.0, type: Number },
        learningRate: { default: 100.9, type: Number },
        nIter: { default: 3500, type: Number },
        metric: { default: "euclidean", type: String },
        imagePath: { default: "", type: String },
        labels: { default: null, type: Array },
    },

    created: function () {
        window.addEventListener("resize", this.updateDimensions);
    },

    mounted() {
        this.init();

        this.once === false ? this.createTsne() : (this.once = true);
        setTimeout(() => {
            this.animate();
        }, 1000 / 30);
    },

    destroyed: function () {
        window.removeEventListener("resize", this.updateDimensions);
    },

    methods: {
        init() {
            const domRect = this.$refs.tsnethree.getBoundingClientRect();

            const clientWidth = domRect.width;
            const clientHeight = domRect.height;

            if (clientWidth === 0 && clientHeight === 0) {
                this.isActive = true;
            }

            //const clientWidth = this.$refs.tsnethree.clientWidth;
            //const clientHeight = this.$refs.tsnethree.clientHeight;

            this.$refs.textlabels.style.width = clientWidth + "px";
            this.$refs.textlabels.style.height = clientWidth + "px";
            this.camera = new THREE.PerspectiveCamera(100, clientWidth / clientHeight, 0.00002, 12000);

            this.camera.position.z = 200;
            this.camera.rotation.x = 1.5;

            this.scene = new THREE.Scene();

            let light = new THREE.AmbientLight("#fff", 1.7);
            this.scene.add(light);

            const color = "#c5c7cf";
            const near = 1;
            const far = 60;
            this.scene.fog = new THREE.Fog(color, near, far);

            light = new THREE.PointLight("#f2242d", 1, 100);
            light.position.set(0, 6, 3);
            light.castShadow = true;

            this.scene.add(light);
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }, { alpha: true });
            this.renderer.setSize(clientWidth, clientHeight);

            const controls = new OrbitControls(this.camera, this.renderer.domElement);
            controls.enableDamping = false;
            controls.enableZoom = true;
            controls.dampingFactor = 0.85;
            controls.maxDistance = 100;
            this.$refs.tsnethree.appendChild(this.renderer.domElement);
        },
        animate() {
            setTimeout(() => {
                if (this.labels != null) {
                    this.remapTextlabels();
                }
            }, 1000 / 30);
            requestAnimationFrame(this.animate);

            this.renderer.render(this.scene, this.camera);
        },

        globalCoordinates(object, camera) {
            var vector = new THREE.Vector3();
            var heightHalf = 0.5 * this.renderer.context.canvas.height;
            var widthHalf = 0.5 * this.renderer.context.canvas.width;

            object.updateMatrixWorld();
            vector.setFromMatrixPosition(object.matrixWorld);
            vector.project(camera);

            vector.x = vector.x * widthHalf + widthHalf;
            vector.y = -(vector.y * heightHalf) + heightHalf;
            return {
                x: vector.x,
                y: vector.y,
            };
        },

        createTextLabels() {
            for (let i = 0; i < this.labels.length; i++) {
                let label = document.createElement("p");
                label.innerHTML += this.labels[i] + "</br>";
                setTimeout(() => {
                    let currentPos = this.globalCoordinates(this.pointsContainer.children[i], this.camera);
                    label.style.marginTop = currentPos.y * 2 + this.$refs.tsnethree.clientHeight / 2 + "px";
                    label.style.marginLeft = currentPos.x * 2 + this.$refs.tsnethree.clientWidth / 2 + "px";
                    this.$refs.textlabels.appendChild(label);
                }, 200);
            }
        },

        remapTextlabels() {
            let children = this.$refs.textlabels.childNodes;

            for (let i = 0; i < this.pointsContainer.children.length; i++) {
                if (typeof children[i] !== "undefined") {
                    let vector = new THREE.Vector3();
                    vector.setFromMatrixPosition(this.pointsContainer.children[i].matrixWorld);
                    this.pointsContainer.children[i].geometry.verticesNeedUpdate = true;

                    let calcs = this.globalCoordinates(this.pointsContainer.children[i], this.camera);

                    children[i].style.marginTop = this.globalCoordinates(this.pointsContainer.children[i], this.camera).y + this.$refs.tsnethree.clientHeight / 2 + "px";
                    children[i].style.marginLeft = calcs.x * 2 + this.$refs.tsnethree.clientWidth / 2 + "px";

                    this.pointsContainer.updateMatrixWorld();
                    this.scene.updateMatrixWorld();
                }
            }
        },

        createThreeModel() {
            let geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([-1, -1, 1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1]);
            const uvs = new Float32Array([0, 0, 0.9, 0.9, 0, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0, 0.9, 0.9, 0, 0, 0.9]);

            geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
            geometry.addAttribute("uv", new THREE.BufferAttribute(uvs, 3));
            geometry.computeVertexNormals();

            for (let i = 0; i < this.tsneOutput.length; i++) {
                let material;
                if (this.imagePath !== "") {
                    let loader = new THREE.TextureLoader();
                    loader.load(i < 9 ? "../assets/" + this.imagePath + "0" + (i + 1) + ".png" : "../assets/" + this.imagePath + (i + 1) + ".png", function (texture) {
                        texture.repeat.set(1, 1);
                        material = new THREE.MeshBasicMaterial({
                            map: texture,
                        });
                        setTimeout(() => {
                            return material;
                        }, 300);
                    });
                } else {
                    material = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(this.modelColor),
                    });
                }

                setTimeout(() => {
                    let sphere = new THREE.Mesh(geometry, material);
                    let zIndex;
                    this.dim === 2 ? (zIndex = 0) : (zIndex = this.tsneOutput[i][2]);
                    if (this.earlyExaggeration > 1.0) {
                        sphere.position.set(this.tsneOutput[i][0], this.tsneOutput[i][1], zIndex);
                    } else {
                        sphere.position.set(this.tsneOutput[i][0] * 1500, this.tsneOutput[i][1] * 1500, zIndex);
                    }
                    this.pointsContainer.add(sphere);
                }, 400);
            }
            this.pointsContainer.position.z -= 2;
            this.scene.add(this.pointsContainer);

            setTimeout(() => {
                if (this.labels != null) {
                    this.createTextLabels();
                }
            }, 200);
        },

        createTsne() {
            let model = new TSNE({
                dim: this.dim,
                perplexity: this.perplexity,
                earlyExaggeration: this.earlyExaggeration,
                learningRate: this.learningRate,
                nIter: this.nIter,
                metric: this.metric,
            });
            model.init({
                data: this.inputData,
                type: "dense",
            });
            model.run();
            model.rerun();
            this.tsneOutput = model.getOutput();
            setTimeout(() => {
                this.createThreeModel();
            }, 300);
        },

        updateDimensions() {
            this.$refs.textlabels.style.width = this.$refs.tsnethree.clientWidth + "px";
            this.$refs.textlabels.style.height = this.$refs.tsnethree.clientHeight + "px";
            this.camera.aspect = this.$refs.tsnethree.clientWidth / this.$refs.tsnethree.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.$refs.tsnethree.clientWidth, this.$refs.tsnethree.clientHeight);
        },
    },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
#tsne-three {
    width: 100%;
}
#tsnethree-text {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    font-size: 10px;
    text-align: center;
    overflow: hidden;
}
#tsnethree-text p {
    position: absolute;
    right: 0;
    top: -50%;
    left: -150%;
}
</style>
